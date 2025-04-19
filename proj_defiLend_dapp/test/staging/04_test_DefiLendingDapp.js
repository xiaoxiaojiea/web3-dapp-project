const { expect } = require("chai")
const { ethers, deployments, network } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")


// 本地网络才执行这个测试
!developmentChains.includes(network.name)  // 如果本地网络标识包含当前使用的网络，则表示使用的本地网络测试
? describe.skip
:describe("test DefiLendingDapp contract", async function() {  // describe（注释，函数）：测试用例的开始
    
    // =============================== 全局变量
    // 账户
    let firstAccount  // 账户1
    let secondAccount  // 账户2
    // 账户的签名（用来指定调用某个合约的签名）
    let firstAccountSigner  // 账户1
    let secondAccountSigner  // 账户2
    // 合约
    let pETHToken  // peth
    let pUSDTToken  // pusdt
    let defiLendingDapp  // DefiLendingDapp


    // beforeEach：每个it之前都要执行一遍
    beforeEach(async function(){
        // ================================================ 前置配置需要
        // 加载并执行名为 "all" 的部署任务（就是 tags 中设置的）。（保证合约在每次调用之前拿到的都是新部署的合约）
        await deployments.fixture("all")

        // getNamedAccounts() 是 Hardhat 提供的工具，用来获取在 hardhat.config.js 文件中配置的账户。
        firstAccount = (await getNamedAccounts()).firstAccount;  // 拿到第一个账户
        secondAccount = (await getNamedAccounts()).secondAccount;  // 拿到第二个账户

        // ******************** 获取 Account 的 Signer ********************
        firstAccountSigner = await ethers.getSigner(firstAccount);  // 不获取的话无法设置到 connect 中
        secondAccountSigner = await ethers.getSigner(secondAccount);

        // 通过 Hardhat 的 deployments 工具获取名为 DefiLendingDapp 的已部署合约对象。（DefiLendingDapp 是你在部署脚本中定义的合约名称）
        const defiLendingDappDeployment = await deployments.get("DefiLendingDapp")  // 根据部署的合约名称取出合约对象
        // 通过 ethers.getContractAt 方法获取这个已部署合约的实例。
        defiLendingDapp = await ethers.getContractAt("DefiLendingDapp", defiLendingDappDeployment.address)  // 得到合约对象中对应的合约类实例
        
        // 得到MyERC20Token类实例化得到的两个合约
        const pETHTokenDeployment = await deployments.get("PETHToken")  // 根据部署的合约名称取出合约对象
        pETHToken = await ethers.getContractAt("MyERC20Token", pETHTokenDeployment.address)  // 得到合约对象中对应的合约类实例
        const pUSDTTokenDeployment = await deployments.get("PUSDTToken")  // 根据部署的合约名称取出合约对象
        pUSDTToken = await ethers.getContractAt("MyERC20Token", pUSDTTokenDeployment.address)  // 得到合约对象中对应的合约类实例

        // ================================================ 后置配置参数（模拟的测试环境）
        await pETHToken.waitForDeployment();
        await pUSDTToken.waitForDeployment();
        await defiLendingDapp.waitForDeployment();
        console.log("\nload pETHToken: ", pETHToken.target);
        console.log("load pUSDTToken: ", pUSDTToken.target);
        console.log("load defiLendingDapp: ", defiLendingDapp.target);

        // mint pETHToken token
        await expect(pETHToken.connect(firstAccountSigner)
            .mint(firstAccount, ethers.parseUnits("1000", 18)))
            .to.emit(pETHToken, "Mint")
            .withArgs(firstAccount, ethers.parseUnits("1000", 18));
        // trans pETHToken to defiLendingDapp
        await pETHToken.connect(firstAccountSigner).transfer(defiLendingDapp.target, ethers.parseUnits("500", 18));
        // approve pETHToken to defiLendingDapp
        await pETHToken.connect(firstAccountSigner).approve(defiLendingDapp.target, ethers.parseUnits("500", 18));

        // mint pUSDTToken token
        await expect(pUSDTToken.connect(firstAccountSigner)
            .mint(firstAccount, ethers.parseUnits("2000000", 18)))
            .to.emit(pUSDTToken, "Mint")
            .withArgs(firstAccount, ethers.parseUnits("2000000", 18));
        // trans pUSDTToken to defiLendingDapp
        await pUSDTToken.connect(firstAccountSigner).transfer(defiLendingDapp.target, ethers.parseUnits("1000000", 18));
        // approve pUSDTToken to defiLendingDapp
        await pUSDTToken.connect(firstAccountSigner).approve(defiLendingDapp.target, ethers.parseUnits("1000000", 18));
        
        // add pETHToken to defiLendingDapp
        await defiLendingDapp.connect(firstAccountSigner).addToken(pETHToken.target, ethers.parseUnits("0.1", 18), ethers.parseUnits("0.8", 18));
        // set pETHToken price
        await defiLendingDapp.connect(firstAccountSigner).setTokenPrice(pETHToken.target, ethers.parseUnits("2000", 18));

        // add pUSDTToken to defiLendingDapp
        await defiLendingDapp.connect(firstAccountSigner).addToken(pUSDTToken.target, ethers.parseUnits("0.1", 18), ethers.parseUnits("0.8", 18));
        // set pUSDTToken price
        await defiLendingDapp.connect(firstAccountSigner).setTokenPrice(pUSDTToken.target, ethers.parseUnits("1", 18));

        // ================================================ 后置配置参数
        console.log("\ninit account balance：");
        const balance1 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance1, 18));

        const balance2 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance2, 18));

        const balance3 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance3, 18));

        const balance4 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance4, 18));
    })

    // 验证存取逻辑
    it("verify deposit and withdraw.", async function(){
        
        // 存款 ETH
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .deposit(pETHToken.target, ethers.parseUnits("5", 18)))
            .to.emit(defiLendingDapp, "Deposit")
            .withArgs(firstAccount, pETHToken.target, ethers.parseUnits("5", 18));

        // 存款 USDT
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .deposit(pUSDTToken.target, ethers.parseUnits("5000", 18)))
            .to.emit(defiLendingDapp, "Deposit")
            .withArgs(firstAccount, pUSDTToken.target, ethers.parseUnits("5000", 18));

        // 检查存款后的余额
        console.log("\ndeposited account balance：");
        const balance1 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance1, 18));
        const balance2 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance2, 18));
        const balance3 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance3, 18));
        const balance4 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance4, 18));

        // 检查存款账户信息
        const account1 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account1);
        const account2 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account2);

        // 模拟挖矿等待3s（让利息增加）
        await helpers.time.increase(10)
        await helpers.mine()  

        // 取款 ETH
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .withdraw(pETHToken.target, ethers.parseUnits("5", 18)))
            .to.emit(defiLendingDapp, "Withdraw")
            .withArgs(firstAccount, pETHToken.target, ethers.parseUnits("5", 18));
        
        // 取款 USDT
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .withdraw(pUSDTToken.target, ethers.parseUnits("5000", 18)))
            .to.emit(defiLendingDapp, "Withdraw")
            .withArgs(firstAccount, pUSDTToken.target, ethers.parseUnits("5000", 18));

        // 检查存款后的余额
        console.log("\nwithdrawed account balance：");
        const balance21 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance21, 18));
        const balance22 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance22, 18));
        const balance23 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance23, 18));
        const balance24 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance24, 18));

        // 检查存款账户信息
        const account21 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account21);
        const account22 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account22);
    })
    
    
    it("verify mortgageAndBorrow and repay.", async function(){
        // 抵押 ETH 借贷 USDT
        const borrowAmount = (ethers.parseUnits("5", 18) * ethers.parseUnits("2000", 18) * ethers.parseUnits("0.8", 18)) / (ethers.parseUnits("1", 18) * ethers.parseUnits("1", 18))
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .mortgageAndBorrow(pETHToken.target, ethers.parseUnits("5", 18), pUSDTToken.target))
            .to.emit(defiLendingDapp, "Borrow")
            .withArgs(firstAccount, pUSDTToken.target, borrowAmount);

        // 检查抵押后的余额
        console.log("\nmortgaged account balance：");
        const balance1 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance1, 18));
        const balance2 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance2, 18));
        const balance3 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance3, 18));
        const balance4 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance4, 18));

        // 检查存款账户信息
        const account1 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account1);
        const account2 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account2);

        // 还掉借贷的 USDT
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .repay(pUSDTToken.target, ethers.parseUnits("8000", 18), pETHToken.target))
            .to.emit(defiLendingDapp, "Repay")
            .withArgs(firstAccount, pUSDTToken.target, ethers.parseUnits("8000", 18));

        // 检查归还后的余额
        console.log("\nborrowed account balance：");
        const balance21 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance21, 18));
        const balance22 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance22, 18));
        const balance23 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance23, 18));
        const balance24 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance24, 18));

        // 检查存款账户信息
        const account21 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account21);
        const account22 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account22);
    })


    it("verify mortgageAndBorrow and liquidate.", async function(){
        // 账户2 mint(由账户owner mint之后转给2) 并且授权 usdt（因为要使用usdt去取账户1借贷的eth）
        await expect(pUSDTToken.connect(firstAccountSigner)
            .mint(firstAccount, ethers.parseUnits("1000000", 18)))
            .to.emit(pUSDTToken, "Mint")
            .withArgs(firstAccount, ethers.parseUnits("1000000", 18));
        // 账户1转给账户2
        await pUSDTToken.connect(firstAccountSigner).transfer(secondAccount, ethers.parseUnits("1000000", 18));;
        // approve pUSDTToken to defiLendingDapp
        await pUSDTToken.connect(secondAccountSigner).approve(defiLendingDapp.target, ethers.parseUnits("1000000", 18));
        // 打印账户2的余额
        const balance = await pUSDTToken.balanceOf(secondAccount);
        console.log("pUSDTToken secondAccount:", ethers.formatUnits(balance, 18));

        // 账户1 抵押 ETH 借贷 USDT
        const borrowAmount = (ethers.parseUnits("5", 18) * ethers.parseUnits("2000", 18) * ethers.parseUnits("0.8", 18)) / (ethers.parseUnits("1", 18) * ethers.parseUnits("1", 18))
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .mortgageAndBorrow(pETHToken.target, ethers.parseUnits("5", 18), pUSDTToken.target))
            .to.emit(defiLendingDapp, "Borrow")
            .withArgs(firstAccount, pUSDTToken.target, borrowAmount);

        // 检查抵押后的余额
        console.log("\nmortgaged account balance：");
        const balance1 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance1, 18));
        const balance2 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance2, 18));
        const balance6 = await pETHToken.balanceOf(secondAccount);
        console.log("pETHToken secondAccount:", ethers.formatUnits(balance6, 18));
        const balance3 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance3, 18));
        const balance4 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance4, 18));
        const balance5 = await pUSDTToken.balanceOf(secondAccount);
        console.log("pUSDTToken secondAccount:", ethers.formatUnits(balance5, 18));

        // 检查存款账户信息
        const account1 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account1);
        const account2 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account2);
        
        // 账户2清算账户1借贷的 USDT
        await expect(defiLendingDapp.connect(secondAccountSigner)
            .liquidate(firstAccount, pETHToken.target, pUSDTToken.target, ethers.parseUnits("8000", 18)))
            .to.emit(defiLendingDapp, "Liquidate")
            .withArgs(secondAccount, firstAccount, pETHToken.target, pUSDTToken.target);

        // 检查抵押后的余额
        console.log("\nmortgaged account balance：");
        const balance21 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance21, 18));
        const balance22 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance22, 18));
        const balance26 = await pETHToken.balanceOf(secondAccount);
        console.log("pETHToken secondAccount:", ethers.formatUnits(balance26, 18));
        const balance23 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance23, 18));
        const balance24 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance24, 18));
        const balance25 = await pUSDTToken.balanceOf(secondAccount);
        console.log("pUSDTToken secondAccount:", ethers.formatUnits(balance25, 18));

        // 检查存款账户信息
        const account21 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account21);
        const account22 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account22);

    })


    it("verify mortgageAndBorrow and liquidate with change price.", async function(){
        // 账户2 mint(由账户owner mint之后转给2) 并且授权 usdt（因为要使用usdt去取账户1借贷的eth）
        await expect(pUSDTToken.connect(firstAccountSigner)
            .mint(firstAccount, ethers.parseUnits("1000000", 18)))
            .to.emit(pUSDTToken, "Mint")
            .withArgs(firstAccount, ethers.parseUnits("1000000", 18));
        // 账户1转给账户2
        await pUSDTToken.connect(firstAccountSigner).transfer(secondAccount, ethers.parseUnits("1000000", 18));;
        // approve pUSDTToken to defiLendingDapp
        await pUSDTToken.connect(secondAccountSigner).approve(defiLendingDapp.target, ethers.parseUnits("1000000", 18));
        // 打印账户2的余额
        const balance = await pUSDTToken.balanceOf(secondAccount);
        console.log("pUSDTToken secondAccount:", ethers.formatUnits(balance, 18));

        // 账户1 抵押 ETH 借贷 USDT
        const borrowAmount = (ethers.parseUnits("5", 18) * ethers.parseUnits("2000", 18) * ethers.parseUnits("0.8", 18)) / (ethers.parseUnits("1", 18) * ethers.parseUnits("1", 18))
        await expect(defiLendingDapp.connect(firstAccountSigner)
            .mortgageAndBorrow(pETHToken.target, ethers.parseUnits("5", 18), pUSDTToken.target))
            .to.emit(defiLendingDapp, "Borrow")
            .withArgs(firstAccount, pUSDTToken.target, borrowAmount);

        // 检查抵押后的余额
        console.log("\nmortgaged account balance：");
        const balance1 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance1, 18));
        const balance2 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance2, 18));
        const balance6 = await pETHToken.balanceOf(secondAccount);
        console.log("pETHToken secondAccount:", ethers.formatUnits(balance6, 18));
        const balance3 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance3, 18));
        const balance4 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance4, 18));
        const balance5 = await pUSDTToken.balanceOf(secondAccount);
        console.log("pUSDTToken secondAccount:", ethers.formatUnits(balance5, 18));

        // 检查存款账户信息
        const account1 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account1);
        const account2 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account2);
        
        // 修改ETH的价格
        // set pETHToken price
        await defiLendingDapp.connect(firstAccountSigner).setTokenPrice(pETHToken.target, ethers.parseUnits("1000", 18));

        // 账户2清算账户1借贷的 USDT
        await expect(defiLendingDapp.connect(secondAccountSigner)
            .liquidate(firstAccount, pETHToken.target, pUSDTToken.target, ethers.parseUnits("8000", 18)))
            .to.emit(defiLendingDapp, "Liquidate")
            .withArgs(secondAccount, firstAccount, pETHToken.target, pUSDTToken.target);

        // 检查抵押后的余额
        console.log("\nmortgaged account balance：");
        const balance21 = await pETHToken.balanceOf(firstAccount);
        console.log("pETHToken firstAccount:", ethers.formatUnits(balance21, 18));
        const balance22 = await pETHToken.balanceOf(defiLendingDapp.target);
        console.log("pETHToken defiLendingDapp:", ethers.formatUnits(balance22, 18));
        const balance26 = await pETHToken.balanceOf(secondAccount);
        console.log("pETHToken secondAccount:", ethers.formatUnits(balance26, 18));
        const balance23 = await pUSDTToken.balanceOf(firstAccount);
        console.log("pUSDTToken firstAccount:", ethers.formatUnits(balance23, 18));
        const balance24 = await pUSDTToken.balanceOf(defiLendingDapp.target);
        console.log("pUSDTToken defiLendingDapp:", ethers.formatUnits(balance24, 18));
        const balance25 = await pUSDTToken.balanceOf(secondAccount);
        console.log("pUSDTToken secondAccount:", ethers.formatUnits(balance25, 18));

        // 检查存款账户信息
        const account21 = await defiLendingDapp.getAccount(firstAccount, pETHToken.target);
        console.log("firstAccount -> pETHToken:", account21);
        const account22 = await defiLendingDapp.getAccount(firstAccount, pUSDTToken.target);
        console.log("firstAccount -> pUSDTToken:", account22);

    })



})
