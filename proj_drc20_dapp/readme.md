# Solidity-Hardhat-React-ERC20-Dapp
使用 Solidity、Hardhat、React 相关技术开发一款ERC20 Dapp

## 创建项目
### 智能合约方面
- npm init
- npx hardhat

- 设置 .env.enc 中的内容

### React方面
- npx create-react-app frontend_erc20
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

## 代币合约 (ERC-20) 项目需求文档
### 项目概述
开发一个基于 Solidity 的 ERC-20 代币合约，并配合 Hardhat 进行测试和部署。该代币应具备基本的转账、余额查询、铸造（增发）和销毁（减少供应量）功能。

### 功能需求
> 对应 contracts/MyErc20Token.sol 文件
- 执行：npx hardhat compile

#### 代币基本属性
合约部署的时候输入下边的内容进行初始化
- 名称 (Name): MyErc20Token
- 符号 (Symbol): MET
- 小数位数 (Decimals): 18 (先不考虑)
- 初始供应量 (Initial Supply): 1,000,000 MET

#### 核心功能
- _ownerMint：owner铸造 
    - 仅合约所有者可用
    - 增发代币到指定地址。

- _userrMint：user铸造
    - 仅 被授权的user 可用
    - user可以铸造的数量为被授权的数量

- _balanceOfUser：余额查询
    - 查询任意地址的代币余额。

- _balanceOfApprove：授权额度查询
    - 查询任意地址的可以铸造代币的额度。

- _transfer：转账
    - 用户向其他地址转账代币

- _burn：销毁
    - 允许用户销毁自己持有的代币，减少总供应量。

- _approveMint：授权
    - owner授权给某个地址允许他去自行mint

- onlyOwner：宏定义——仅所有者可操作

- balanceEnough：宏定义——某个地址的余额大余指定数量

## 项目部署

### 本地部署脚本（测试环境）
> 对应 deploy/deploy_MyErc20Token.js  文件
- 执行：npx hardhat deploy

### 测试脚本
> 对应 test/uint.test.js  文件
- 执行：npx hardhat test

**测试内容**
- _ownerMint：仅 owner 可以调用
- _ownerMint：mint总量达到
- _ownerMint：正常mint（owner给自己mint）
- _ownerMint：正常mint正常mint（owner给别人mint）
- _approveMintBal：仅 owner 可以调用
- _approveMintBal：正常 approve
- _userrMint：没有给账户 secondAccount 授权任何余额
- _userrMint：mint超过approve余额
- _userrMint：正常 _userrMint
- _transfer：sender balance is not enough
- _transfer：transfer success
- _burn：燃烧成功

### 线上部署脚本（生产环境）
> 对应 deploy/deploy_MyErc20Token.js  文件
- 执行：npx hardhat deploy --network sepolia
- 输出部署合约地址： 0x3CA742d5FE996133917C714D032CF1c04FE70a17
- sepolia查看验证的代码： https://sepolia.etherscan.io/address/0x3CA742d5FE996133917C714D032CF1c04FE70a17#code
- 在sepolia界面操作一番看看










