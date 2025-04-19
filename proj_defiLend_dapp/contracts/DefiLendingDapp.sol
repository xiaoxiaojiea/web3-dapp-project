// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "hardhat/console.sol"; // 仅限 Hardhat 环境

import "./MyERC20Token.sol";

// 1，只有存款才计算利息
// 2，抵押和存款概念要理清楚
//      - 存款与取款是一个等级：牵扯到利息计算
//      - 抵押、借款与还款是一个等级：
// 3，输入的都要 x1e18 （因为有可能要输入小数，这些内容后续都要在前端处理）

contract DefiLendingDapp {

    // ========================================== 数据结构
    // 当前借贷池子中代币的存储数据结构
    /**
     * 年化利率: 指如果资金借出或存入一整年所获得的利息比率。
     *      利息 = 本金 × 年利率 × 时间（年）
     *      存储的是放大100倍的值，计算的时候徐需要除以100 (避免浮点数计算)
     *          - 如 1% 值为 1
     *          - 如 100% 值为 100
     * 抵押因子: 关键风险控制参数，它决定了用户可以用多少抵押资产借出其他资产
     *      最大可借金额 = 抵押资产价值 × 抵押因子
     *          - 用户抵押价值 $10,000 的ETH（抵押因子80%）
     *              则最大可借：$10,000 × 80 = $8,000 其他资产
     *      存储的是放大100倍的值，计算的时候徐需要除以100 (避免浮点数计算)
     */
    struct TokenInfo {
        bool isAccepted;    // 是否接受该代币
        uint256 totalSupply; // 总存款量
        uint256 totalBorrowed; // 总借贷量
        uint256 interestRate; // 年化利率（百分数的小数乘以了 1e18）
        uint256 collateralFactor; // 抵押因子（百分数的小数乘以了 1e18）
    }

    // 用户账户数据
    struct Account {
        uint256 deposited;  // 存款金额
        uint256 borrowed;   // 借款金额
        uint256 lastUpdated; // 上次更新时间
    }

    // ========================================== 变量定义
    // 创建者
    address public _owner;  
    // 精度
    uint256 public constant PRECISION = 1e18;  // 代币数量扩大了这个多倍
    // 清算奖励分数(奖励10%)
    uint256 public constant LIQUIDATE_REWARD = (11 * PRECISION) / 10;   // 原来的 110%

    // 支持的代币列表
    mapping(address => TokenInfo) public tokens; 
    // 代币价格 (1e18精度)
    mapping(address => uint256) public tokenPrices;   // 价格也是乘以 1e18 了
    // 用户存借数据: 用户--(对某个代币--操作信息)
    mapping(address => mapping(address => Account)) public accounts; 
    // 新增存储所有token地址的变量（用于遍历所有token，找出某个用户的存、借信息）
    address[] public acceptedTokens; // 存储所有支持的代币地址

    // 一年的秒数
    uint256 public constant SECONDS_PER_YEAR = 31536000; 

    // ========================================== 事件定义
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 amount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event Liquidate(
        address indexed liquidator,  // 清算人
        address indexed borrower,  // 为债务人
        address indexed collateralToken,  // 偿还债务代币A
        address debtToken  // 使用代币B支付的
    );

    // ========================================== Getter函数
    function getAccount(address add1, address add2) public view returns (Account memory) {
        return accounts[add1][add2];
    }

    // ========================================== 宏定义
    // 仅仅owner可操作
    modifier OnlyOwner() {
        require(_owner == msg.sender, "Only owner can call this!");
        _;
    }

    // ========================================== 函数定义
    // 初始化合约
    constructor() {
        _owner = msg.sender;
    }

    // 添加合约中支持借贷的代币
    function addToken(
        address tokenAddress,  // 代币地址
        uint256 interestRate,
        uint256 collateralFactor
    ) external OnlyOwner {
        require(!tokens[tokenAddress].isAccepted, "Token already added");
        // 抵押因子不能高（我自己不能亏，不支持浮点运算，所以0.9先表示为9再除以10）
        require(collateralFactor <= (9 * PRECISION) / 10, "CollateralFactor too high");

        // 添加代币
        tokens[tokenAddress] = TokenInfo({
            isAccepted: true,  // 是否接受该代币
            totalSupply: 0,  // 总存款量
            totalBorrowed: 0,  // 总借贷量
            interestRate: interestRate,  // 年化利率
            collateralFactor: collateralFactor  // 抵押因子
        });

        // 添加到支持列表
        acceptedTokens.push(tokenAddress);
    }

    // 设置某个代币的价格 (仅owner)
    function setTokenPrice(
        address token, 
        uint256 price
    ) external OnlyOwner {
        tokenPrices[token] = price;  // 输入的已经 x1e18 了
    }

    // 存款
    function deposit(
        address token, 
        uint256 amount  // 输入数量也要记得乘 1e18（因为solidity不允许浮点运算）
    ) external {
        require(tokens[token].isAccepted, "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(tokenPrices[token] > 0, "Token price not set");

        // 更新调用者对于某个token的利息（前面有存款的则将利息计算出来添加到存款总额度中）
        updateInterest(msg.sender, token);

        // 转移代币（存入）
        MyERC20Token(token).transferFrom(msg.sender, address(this), amount);

        // 更新 当前用于对于当前token的 存款总量
        accounts[msg.sender][token].deposited += amount;  // 记录存款数量
        tokens[token].totalSupply += amount;  // 总存款量更新

        emit Deposit(msg.sender, token, amount);
    }

    // 取款
    function withdraw(
        address token,   // 取某个token
        uint256 amount  // 取多少钱（输入数量也要记得乘 1e18，计算的时候再除掉）
    ) external {
        require(amount > 0, "Amount must be greater than 0");

        // 更新调用者当前token的利息
        updateInterest(msg.sender, token);

        // 保证存款数 大余 取款金额
        require(accounts[msg.sender][token].deposited >= amount, "Insufficient balance");  

        // 更新状态
        accounts[msg.sender][token].deposited -= amount;  // 减去存款数量
        tokens[token].totalSupply -= amount;  // 减去存款总量

        // 转移代币（转到调用者账户）
        MyERC20Token(token).transfer(msg.sender, amount);

        emit Withdraw(msg.sender, token, amount);
    }

    // 抵押借款（将自身的币转到合约中，然后借出希望的币，不牵扯自身存进去的币）
    function mortgageAndBorrow (
        address mortgageToken,   // 要抵押的token
        uint256 mortgageAmount,  // 要抵押的token数量 （输入要乘以 1e18）
        address borrowToken   // 要借款的token
    ) external {
        require(tokens[mortgageToken].isAccepted && tokens[borrowToken].isAccepted, "Token not supported");
        require(tokenPrices[mortgageToken] > 0 && tokenPrices[borrowToken] > 0, "Token price not set");
        require(mortgageAmount > 0, "mortgageAmount must be greater than 0");

        // 得到抵押人抵押mortgageAmount数量的mortgageToken可以借到代币borrowToken的数量borrowAmount
        //      借款数量 = （抵押的数量(1e18) * 抵押代币的价格(1e18) * 抵押因子(100)）/ 借贷代币的价格(1e18) * 倍率 * 抵消一个1e18； （倍率是因为 抵押因子 扩大了100倍）
        uint256 borrowAmount = (mortgageAmount * tokenPrices[mortgageToken] * tokens[mortgageToken].collateralFactor) / (tokenPrices[borrowToken] * PRECISION);
        require(borrowAmount > 0, "borrowAmount must be greater than 0");
        require(MyERC20Token(borrowToken).balanceOf(address(this)) >= borrowAmount, "Insufficient borrowAmount balance");
        require(MyERC20Token(mortgageToken).balanceOf(msg.sender) >= mortgageAmount, "Insufficient mortgageAmount balance");

        // 更新状态
        accounts[msg.sender][borrowToken].borrowed += borrowAmount;  // 借款代币的金额增加
        tokens[borrowToken].totalBorrowed += borrowAmount;  // 代币的借贷总量增加

        // 转移代币
        MyERC20Token(mortgageToken).transferFrom(msg.sender, address(this), mortgageAmount);  // 给合约
        MyERC20Token(borrowToken).transfer(msg.sender, borrowAmount);  // 给借款人

        emit Borrow(msg.sender, borrowToken, borrowAmount);
    }

    // 还款
    function repay(
        address borrowToken,  // 要还款的token(之前借出去的token)
        uint256 repayBorrowTokenAmount,  // 还多少（也就是允许不还完）  （输入要乘以 1e18）
        address withdrawToken  // 得到抵押的token地址
    ) external {
        require(tokens[withdrawToken].isAccepted && tokens[borrowToken].isAccepted, "Token not supported");
        require(tokenPrices[withdrawToken] > 0 && tokenPrices[borrowToken] > 0, "Token price not set");
        require(repayBorrowTokenAmount > 0, "repayTokenAmount must be greater than 0");

        // 得到用户需要使用 borrowToken 支付的真实数量
        uint256 actualBorrowAmount = min(repayBorrowTokenAmount, accounts[msg.sender][borrowToken].borrowed);

        // 得到用户可以得到的抵押物数量
        uint256 actualRepayBorrowTokenAmount = ( actualBorrowAmount * tokenPrices[borrowToken] * PRECISION ) / (tokenPrices[withdrawToken] * tokens[borrowToken].collateralFactor);
        require(actualRepayBorrowTokenAmount > 0, "actualRepayBorrowTokenAmount must be greater than 0");
        require(MyERC20Token(withdrawToken).balanceOf(address(this)) >= actualRepayBorrowTokenAmount, "Insufficient actualRepayBorrowTokenAmount balance");  // 合约支付得起
        require(MyERC20Token(borrowToken).balanceOf(msg.sender) >= actualBorrowAmount, "Insufficient actualBorrowAmount balance");  // 用户支付得起

        // console.log("1:", repayBorrowTokenAmount); // 会在测试终端打印
        // console.log("2:", actualRepayBorrowTokenAmount); // 会在测试终端打印

        // 更新状态
        accounts[msg.sender][borrowToken].borrowed -= actualBorrowAmount;
        tokens[borrowToken].totalBorrowed -= actualBorrowAmount;

        // 转移代币（还款）
        MyERC20Token(borrowToken).transferFrom(msg.sender, address(this), actualBorrowAmount);  // 用户还款
        MyERC20Token(withdrawToken).transfer(msg.sender, actualRepayBorrowTokenAmount);  // 归还借款人抵押物

        emit Repay(msg.sender, borrowToken, actualBorrowAmount);
    }

    // 清算（将抵押物的10%奖励给清算人）
    function liquidate(
        address borrower,  // 原来是谁借的这个钱
        address collateralToken,  // 当时借钱的人抵押的什么代币（如ETH）
        address forRepayToken,  // 当时借钱的人借的什么代币（如USDT）
        uint256 collateralTokenAmount  // 清算人想偿还的债务数量（如100USDT） （输入要乘以 1e18）
    ) external {
        require(tokens[collateralToken].isAccepted && tokens[forRepayToken].isAccepted, "Token not supported");
        require(tokenPrices[collateralToken] > 0 && tokenPrices[forRepayToken] > 0, "Token price not set");
        require(collateralTokenAmount > 0, "collateralTokenAmount must be greater than 0");

        // 得到欠债人欠的真实的数量（得到用户想偿还 与 欠债人实际欠债 的最小数量）
        uint256 actualCollateralAmount = min(collateralTokenAmount, accounts[borrower][forRepayToken].borrowed);

        // 清算人可以得到的抵押物数量
        //      需要支付的数量 = （待还款代币数量(1e18) * 奖励10%(100) * 代币金额(1e18) ）/ 待还款代币抵押因子(100) * 用于清算的代币金额(1e18)
        uint256 forRepayAmount = (actualCollateralAmount * LIQUIDATE_REWARD * tokenPrices[forRepayToken]) / (tokenPrices[collateralToken] * tokens[forRepayToken].collateralFactor);
        require(forRepayAmount > 0, "forRepayAmount must be greater than 0");
        require(MyERC20Token(collateralToken).balanceOf(address(this)) >= forRepayAmount, "Insufficient forRepayAmount balance");  // 合约支付得起
        require(MyERC20Token(forRepayToken).balanceOf(msg.sender) >= actualCollateralAmount, "Insufficient actualCollateralAmount balance");  // 用户支付得起

        console.log("1:", actualCollateralAmount); // 会在测试终端打印
        console.log("2:", actualCollateralAmount * LIQUIDATE_REWARD); // 会在测试终端打印
        console.log("3:", actualCollateralAmount * LIQUIDATE_REWARD * tokenPrices[forRepayToken]); // 会在测试终端打印

        // 更新状态
        accounts[borrower][forRepayToken].borrowed -= actualCollateralAmount;  // 原来借款人的借款金额更新
        tokens[forRepayToken].totalBorrowed -= actualCollateralAmount;
        
        // 转移代币
        MyERC20Token(forRepayToken).transferFrom(msg.sender, address(this), actualCollateralAmount);  // 清算人将实际支付的代币转到合约中
        MyERC20Token(collateralToken).transfer(msg.sender, forRepayAmount);  // 然后将清算人应该得到的代币转移给清算人（奖励了10%）

        emit Liquidate(msg.sender, borrower, collateralToken, forRepayToken);
    }

    // 更新利息（只有存款才有利息，借贷与抵押都没有利息）
    function updateInterest(
        address user, 
        address token
    ) internal {
        // 用户对某个代币的操作信息
        Account storage account = accounts[user][token];
        // 用户上次操作的时间距离现在多久了
        uint256 timeElapsed = block.timestamp - account.lastUpdated;

        // 因为当前要更新这个用户对于这个token的余额，所以我们这边直接计算出之前的利息加到存款中（让利息重新计算）
        //      当前用户对当前token的操作有时间间隔 and 当前用户对当前token的存款数量>0（只有存款才产生利息）
        if (timeElapsed > 0 && account.deposited > 0) {
            // 计算前边的存款已经得到的所有利息（这些利息将会添加到现有的本金中进行复利，然后总量再加上新加入的，并且时间重置）
            //      利息 = (现有存款数量 * 利率 * 存储时间) / (一年的时间 * 利率处理为百分数)
            uint256 interest = (account.deposited * tokens[token].interestRate * timeElapsed) / (SECONDS_PER_YEAR * PRECISION);

            // 将利息添加到该用户的存款中（复利）
            account.deposited += interest;
            tokens[token].totalSupply += interest;  //添加该代币的存款总量
        }
        
        // 更新该用户对于该token的最新操作时间
        account.lastUpdated = block.timestamp;
    }
    
    // 取小函数
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

}

