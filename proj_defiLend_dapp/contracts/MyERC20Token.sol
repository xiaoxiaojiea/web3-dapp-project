// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20Token is ERC20 {

    // ========================================== 变量定义
    address public _owner;  // 创建者

    // ========================================== 事件定义
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    // ========================================== 宏定义
    // 仅仅owner可操作
    modifier OnlyOwner() {
        require(_owner == msg.sender, "Only owner can call this!");
        _;
    }
    // 某个账户可操作余额充足
    modifier Balancesufficient(address addr, uint256 amount) {
        require(balanceOf(addr) >= amount, "Balance insufficient!");
        _;
    }

    // ========================================== 函数定义
    // 构造函数
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _owner = msg.sender;
    }

    // mint函数（调用 ERC20 内部自己的 _mint 函数）
    function mint(address to, uint256 amount) external OnlyOwner{
        _mint(to, amount);
        emit Mint(to, amount);
    }

    // burn函数（调用 ERC20 内部自己的 _burn 函数）
    function burn(address from, uint256 amount) external OnlyOwner Balancesufficient(from, amount){
        _burn(from, amount);

        emit Burn(from, amount);
    }

}