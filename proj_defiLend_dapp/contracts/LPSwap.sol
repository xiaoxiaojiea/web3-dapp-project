// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./MyERC20Token.sol";


// 这里输入的PETH与PUSDT的单位需要是wei（也就是要乘以1e18），因为智能合约不能输入小数。
//      实际使用过程中前端允许输入小数，然后前端转换为整数后调用智能合约。

contract LPSwap {
    
    // ========================================== 变量定义
    // pair
    MyERC20Token public _PETH;
    MyERC20Token public _PUSDT;

    // 流动性池子中pair各自的数量
    uint256 public _reservePETH;
    uint256 public _reservePUSDT;

    // ========================================== 事件定义
    event LiquidityAdded(address indexed provider, uint256 amountPETH, uint256 amountPUSDT);
    event LiquidityRemoved(address indexed provider, uint256 amountPETH, uint256 amountPUSDT);
    event Swapped(
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        address indexed tokenOut,
        uint256 amountOut
    );

    // ========================================== 宏定义


    // ========================================== 函数定义
    constructor(address peth_addr, address pusdt_addr) {
        _PETH = MyERC20Token(peth_addr);
        _PUSDT = MyERC20Token(pusdt_addr);
    }

    // 添加流动性
    function addLiquidity(uint256 amountPETH, uint256 amountPUSDT) external {
        require( (amountPETH>0 && amountPUSDT>0), "Amounts must be greater than 0!");

        // 首次添加直接根据输入数量确定，非首次添加需要计算是否满足K的（多余的U转回给调用者）
        if (_reservePETH != 0 && _reservePUSDT != 0) {  // 非首次添加流动性

            // 检查发送的U比例是否正确（）
            //      交易保证k不变：x * y = k
            //      添加流动性保证pair比例不变：x'/y' = x/y
            uint256 expectedPUSDT = (amountPETH * _reservePUSDT) / _reservePETH;  // 使用 x'/y' = x/y 推
            require(amountPUSDT >= expectedPUSDT, "Need more PUSDT amount!");

            // 更新amountPUSDT，并且退还多的amountPUSDT
            if (amountPUSDT > expectedPUSDT) {
                amountPUSDT = expectedPUSDT;

                // 退还多余的部分
                uint256 excess = amountPUSDT - expectedPUSDT;
                _PUSDT.transfer(msg.sender, excess);
            }
        }

        // 转移代币
        _PETH.transferFrom(msg.sender, address(this), amountPETH);
        _PUSDT.transferFrom(msg.sender, address(this), amountPUSDT);

        // 更新池子中pair的数量
        _reservePETH += amountPETH;
        _reservePUSDT += amountPUSDT;
        
        emit LiquidityAdded(msg.sender, amountPETH, amountPUSDT);
    } 

    // 移除流动性（要移除的流动性百分比(1-100)）
    function removeLiquidity(uint256 liquidityPercent) external {
        require((liquidityPercent > 0 && liquidityPercent <= 100), "Invalid percentage!");

        // 计算要移除的数量
        uint256 amountPETH = (_reservePETH * liquidityPercent) / 100;
        uint256 amountPUSDT = (_reservePUSDT * liquidityPercent) / 100;
        require((amountPETH > 0 && amountPUSDT > 0), "Insufficient liquidity");
        
        // 直接更新储备
        _reservePETH -= amountPETH;
        _reservePUSDT -= amountPUSDT;
        
        // 返还代币给调用者
        _PETH.transfer(msg.sender, amountPETH);
        _PUSDT.transfer(msg.sender, amountPUSDT);
        
        emit LiquidityRemoved(msg.sender, amountPETH, amountPUSDT);
    }

    // 交换代币
    function swap(
        uint256 amountIn,
        address inputToken
    ) external returns (uint256 amountOut) {

        require(amountIn > 0, "Input amount must be positive");
        require(
            inputToken == address(_PETH) || inputToken == address(_PUSDT),
            "Invalid input token"
        );
        
        // 得到输入与输出代币
        bool isPETH = inputToken == address(_PETH);
        uint256 reserveIn = isPETH ? _reservePETH : _reservePUSDT;
        uint256 reserveOut = isPETH ? _reservePUSDT : _reservePETH;
        
        // 计算输出代币的数量：(reserveIn + amountIn) * (reserveOut - amountOut) = reserveIn * reserveOut
        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
        
        // 更新储备,执行转账
        if (isPETH) {
            _reservePETH += amountIn;
            _reservePUSDT -= amountOut;

            // 执行转账
            _PETH.transferFrom(msg.sender, address(this), amountIn);
            _PUSDT.transfer(msg.sender, amountOut);
        } else {
            _reservePUSDT += amountIn;
            _reservePETH -= amountOut;

            // 执行转账
            _PUSDT.transferFrom(msg.sender, address(this), amountIn);
            _PETH.transfer(msg.sender, amountOut);
        }

    }

    // 获取当前价格(1 PETH = ? PUSDT)
    function getPrice() public view returns (uint256) {
        if (_reservePUSDT == 0 || _reservePETH == 0) revert("No liquidity");

        return (_reservePUSDT * 1e18) / _reservePETH; // 带18位精度
    }


}
