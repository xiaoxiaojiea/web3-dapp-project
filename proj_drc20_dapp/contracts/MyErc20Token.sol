// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract MyErc20Token {

    // token基础属性
    string public _name;  // token name
    string public _symbol;  // token symbol
    uint256 public _totalSupply;  // 总供应量
    uint256 public _totalMinted;  // 总mint数量
    mapping(address => uint256) public _balance;  // 余额记录

    // 权限相关
    address public _owner;  // 合约拥有者
    mapping(address => uint256) public _approveMintBal;  // owner授权给mint权限的数量

    // 事件（必须使用indexed到固定长度类型：address, uint, bool, bytes32等中）
    event emitTransfer(address indexed from, address indexed to, uint256 amount);
    event emitApprove(address indexed from, address indexed to, uint256 amount);

    // 构造函数得到ERC20 token
    constructor(
        string memory name_, 
        string memory symbol_, 
        uint256 totalSupply_) {

        _name = name_;
        _symbol = symbol_;
        _totalSupply = totalSupply_;

        _owner = msg.sender;
    }

    // 铸造: 仅合约所有者可用(普通用户不能调用此功能) === finished test ===
    //      合约所有者可以增发代币到指定地址
    function _ownerMint(
        address _toAddr,   // 基本类型（uint, address, bool 等）不需要位置修饰符
        uint256 _amount) public onlyOwner {
        require((_totalMinted+_amount) < _totalSupply, "totalSupply is reach!");

        _balance[_toAddr] += _amount;

        _totalMinted += _amount;

        // 提交emit
        emit emitTransfer(_owner, _toAddr, _amount);
    }

    // 铸造: user调用为自己铸造coin  === finished test ===
    //      仅授权用户可用
    function _userrMint(uint256 _amount) public {
        require(_approveMintBal[msg.sender] >= _amount, "you have not be approved or approve balance is enough!");
        require((_totalMinted+_amount) < _totalSupply, "totalSupply is reach!");

        _balance[msg.sender] += _amount;
        _approveMintBal[msg.sender] -= _amount;
        _totalMinted += _amount;

        // 提交emit
        emit emitTransfer(msg.sender, msg.sender, _amount);
    }

    // 余额查询：查询任意地址的代币余额
    function _balanceOfUser(address _user) public view returns (uint256) {
        return _balance[_user];
    }

    // 授权余额查询：查询任意user地址的授权代币余额
    function _balanceOfApprove(address _user) public view returns (uint256) {
        return _approveMintBal[_user];
    }

    // 转账: 允许用户向其他地址转账代币   === finished test ===
    //      如果余额不足，交易应失败。
    function _transfer(
        address _toAddr,
        uint256 _amount) public balanceEnough(msg.sender, _amount) {

        _balance[msg.sender] -= _amount;
        _balance[_toAddr] += _amount;

        // 提交emit
        emit emitTransfer(msg.sender, _toAddr, _amount);
    }

    // 销毁: 允许用户销毁自己持有的代币，减少总供应量。  === finished test ===
    function _burn(uint256 _amount) public balanceEnough(msg.sender, _amount) { 
        // 减少
        _balance[msg.sender] -= _amount;
        _totalSupply -= _amount;
        
        emit emitTransfer(msg.sender, address(0), _amount);
    }
    
    // 授权: owner授权给某个地址允许他去自行mint  === finished test ===
    function _approveMint(address _toAddr, uint256 _amount) public onlyOwner {
        _approveMintBal[_toAddr] += _amount;

        emit emitApprove(msg.sender, _toAddr, _amount);
    }

    // 只有权限拥有者才可以操作
    modifier onlyOwner() {
        require(msg.sender == _owner, "only owner can do it!");
        _;
    }

    // 余额要达到某个数量
    modifier balanceEnough(address _addr, uint256 _amount) {
        require(_balance[_addr] >= _amount, "balance is not enough!");
        _;
    }

}

