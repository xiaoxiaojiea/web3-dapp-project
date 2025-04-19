# Solidity-Hardhat-React-DLP（DeFi Lending Platform）-Dapp
使用 Solidity、Hardhat、React 相关技术开发一款DeFi Lending Platform（去中心化借贷平台）

## 创建项目
### 智能合约方面
- npm init
- npx hardhat

- 设置 .env.enc 中的内容

### React方面
- npx create-react-app frontend_dlp
- npm start (记得访问不 http://192.168.0.100:3000/ 不然调不起来metamask)
- 进入public/index.html，修改网站的标题和元描述
- 进入src文件夹，删除App.test.js、logo.svg和setupTests.js文件。
- 进入App.js文件，用以下模板替换其内容。

``` Javascript
import './App.css';

function App() {
    return (
        <h1>Hello World</h1>
    );
}

export default App;
```

- 同时删除App.css的所有内容。但是，不要删除这个文件。
- 然后就可以在这个模板上编写前端代码了。

## 借贷平台 (DeFi Lending Platform) 项目需求文档
构建一个基于Solidity的智能合约借贷平台，为用户提供安全、透明、无需信任中介的借贷服务。

### 功能需求
- MyERC20Token合约, 发布两个币种，用于模拟一个借贷另一个：一个 PETH ，一个 PUSDT 
    - PETH：仿ETH
    - PUSDT：仿USDT（稳定币）

- LPSwap合约：用于模拟 PETH-PUSDT 之间的价格变化

- DefiLendingDapp合约: 用于实现一个借贷另一个

### MyERC20Token合约
> 合约 MyERC20Token.sol 可以直接实例化出来两个合约：1）PETH：（"Pseudo-ETH", "PETH"）；2）PUSDT：（"Pseudo-USDT", "PUSDT"）
> 对应 contracts/MyERC20Token.sol 文件
> 执行：npx hardhat compile

- mint：铸造，owner可用

- burn：燃烧，owner可用

- transfer：转账

- balancesof：查看余额

### LPSwap合约

- 添加流动性

- 移除流动性（要移除的流动性百分比(1-100)）

- 得到价格

- 交换

- 得到价格

### DefiLendingDapp合约
- 存款

- 还款

- 抵押贷款

- 还贷款取回抵押

- 清算：当借款人的抵押资产价值下降到不足以覆盖其借款金额时，系统自动触发强制出售抵押资产以偿还债务的过程。
    - 当抵押物价值低于清算阈值时触发
    - 清算人可获得奖励

## 项目部署

### 本地部署脚本（测试环境）
> 对应 deploy/deploy_MyErc20Token.js  文件
- 执行：npx hardhat deploy

### 测试脚本
> 对应 test/staging/04_test_DefiLendingDapp.js  文件
- 执行：npx hardhat test

**测试内容**
- 验证存取逻辑
- 验证借款还款逻辑
- 验证借款清算逻辑
- 验证借款价格改变清算逻辑

### 线上部署脚本（生产环境）
> 对应 deploy 中的文件
- 执行：npx hardhat deploy --network sepolia
- 输出部署合约地址： 
    - PETHToken： 0x0642a3a85EE7F9dD52B82caa7C3aE6d8F712427c
    - PUSDTToken： 0x1a1Dd7994A1bA16BD2a58cd076EbeA69266587D6
    - LPSwap： 0xa09B5a5DdED094Ba656d6416976F1DF62aA889e4
    - DefiLendingDapp： 0xb8026085CfcD6D0F3D06023e541466A28D5deb9B

- sepolia查看验证的代码： https://sepolia.etherscan.io/address/合约地址#code
- 在sepolia界面操作一番看看











