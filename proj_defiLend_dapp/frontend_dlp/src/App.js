import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import contractMyERC20Token from "./contracts/MyERC20Token.json";
import contractLPSwap from "./contracts/LPSwap.json";
import contractDefiLendingDapp from "./contracts/DefiLendingDapp.json";

const contractPETHAddress = "0x0642a3a85EE7F9dD52B82caa7C3aE6d8F712427c";
const contractPUSDTAddress = "0x1a1Dd7994A1bA16BD2a58cd076EbeA69266587D6";
const abiMyERC20Token = contractMyERC20Token.abi;  // abi

const contractLPSwapAddress = "0xa09B5a5DdED094Ba656d6416976F1DF62aA889e4";
const abiLPSwap = contractLPSwap.abi;  // abi

const contractDefiLendingDappAddress = "0xb8026085CfcD6D0F3D06023e541466A28D5deb9B";
const abiDefiLendingDapp = contractDefiLendingDapp.abi;  // abi


const precision = 18;

function App() {


    // ============================================================== 变量定义
    // 当前链接网络的chainId
    const [currentChainId, setCurrentChainId] = useState(null);
    // 链接用户的钱包地址
    const [currentAccount, setCurrentAccount] = useState(null);  

    const [addressMintPETH, setAddressMintPETH] = useState(null); 
    const [mintPETHAmount, setMintPETHAmount] = useState(null);
    const [addressMintPUSDT, setAddressMintPUSDT] = useState(null); 
    const [mintPUSDTAmount, setMintPUSDTAmount] = useState(null);

    const [addressPETHBal, setAddressPETHBal] = useState(null); 
    const [userPETHBal, setUserPETHBal] = useState(null);
    const [addressPUSDTBal, setAddressPUSDTBal] = useState(null); 
    const [userPUSDTBal, setUserPUSDTBal] = useState(null);

    const [addressPETHTrans, setAddressPETHTrans] = useState(null); 
    const [addressPETHTransAmount, setAddressPETHTransAmount] = useState(null);
    const [addressPUSDTTrans, setAddressPUSDTTrans] = useState(null); 
    const [addressPUSDTTransAmount, setAddressPUSDTTransAmount] = useState(null);

    const [addressPETHApprove, setAddressPETHApprove] = useState(null); 
    const [addressPETHApproveAmount, setAddressPETHApproveAmount] = useState(null); 
    const [addressPUSDTApprove, setAddressPUSDTApprove] = useState(null); 
    const [addressPUSDTApproveAmount, setAddressPUSDTApproveAmount] = useState(null); 

    const [addTokenAddress, setAddTokenAddress] = useState(null); 
    const [addTokenAddressRate, setAddTokenAddressRate] = useState(null); 
    const [addTokenAddressFactor, setAddTokenAddressFactor] = useState(null); 

    const [setPriceAddress, setSetPriceAddress] = useState(null); 
    const [setPricePrice, setSetPricePrice] = useState(null); 

    const [addDepositAddress, setAddDepositAddress] = useState(null); 
    const [addDepositAmount, setAddDepositAmount] = useState(null); 

    const [withdrawMoneyAddress, setWithdrawMoneyAddress] = useState(null); 
    const [withdrawMoneyAmount, setWithdrawMoneyAmount] = useState(null); 

    const [token1Amount, setToken1Amount] = useState(null); 
    const [token2Amount, setToken2Amount] = useState(null); 

    const [newPrice, setNewPrice] = useState(null); 
    const [newPriceShow, setNewPriceShow] = useState(null); 
    const [userPETHBalLP, setUserPETHBalLP] = useState(null);

    const [swapTokenAddress, setSwapTokenAddress] = useState(null); 
    const [swapTokenAmount, setSwapTokenAmount] = useState(null); 
    const [userSwapAmount, setUserSwapAmount] = useState(null); 
    

    // ============================================================== 按钮

    // 链接钱包按钮
    const connectWalletButton = () => {
        return (
        
        <button onClick={connectWalletHandler} className='btn'>
            Connect Wallet
        </button>
        )
    }

    // 链接上钱包之后的页面
    const connectedPage = () => {
        return (
            <div className='border-app'>
                <hr></hr>
                
                {/* 账户相关 */}
                <div className='clip-border'>
                    <h4>账户相关</h4>
                    {currentAccount && (
                        <div>
                            <p>已连接钱包地址: {currentAccount}</p>
                        </div>
                    )}
                    <p>PETHToken： 0x0642a3a85EE7F9dD52B82caa7C3aE6d8F712427c</p>
                    <p>PUSDTToken： 0x1a1Dd7994A1bA16BD2a58cd076EbeA69266587D6c</p>
                    <p>LPSwap： 0xa09B5a5DdED094Ba656d6416976F1DF62aA889e4</p>
                    <p>DefiLendingDapp： 0xb8026085CfcD6D0F3D06023e541466A28D5deb9B</p>
                </div>

                <hr></hr>

                {/* Token相关 */}
                <div className='clip-border'>
                    <h4>Token相关</h4>

                    {/* mint */}
                    <div className='single-border'>
                        <button onClick={ownerMintPETHHandler} className='btn'>
                            MintPETH
                        </button>
                        <input
                            type="text"
                            value={addressMintPETH}
                            onChange={handleAddressMintPETHChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={mintPETHAmount}
                            onChange={handlemMintPETHAmountChange}
                            placeholder="Enter mint amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>
                    <div className='single-border'>
                        <button onClick={ownerMintPUSDTHandler} className='btn'>
                            MintPUSDT
                        </button>
                        <input
                            type="text"
                            value={addressMintPUSDT}
                            onChange={handleAddressMintPUSDTChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={mintPUSDTAmount}
                            onChange={handlemMintPUSDTAmountChange}
                            placeholder="Enter mint amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>

                    {/* check balance */}
                    <div className='single-border'>
                        <button onClick={getUserPETHBalHandler}  className='btn'>
                            PETH余额查询
                        </button>

                        <input
                            type="text"
                            value={addressPETHBal}
                            onChange={handleAddressPETHBalChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />

                        {newPriceShow && <span>余额: {newPriceShow}</span>}
                    </div>
                    <div className='single-border'>
                        <button onClick={getUserPUSDTBalHandler}  className='btn'>
                            PUSDT余额查询
                        </button>

                        <input
                            type="text"
                            value={addressPUSDTBal}
                            onChange={handleAddressPUSDTBalChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />

                        {userPUSDTBal && <span>余额: {userPUSDTBal}</span>}
                    </div>

                    {/* trans */}
                    <div className='single-border'>
                        <button onClick={transferPETHHandler}  className='btn'>
                            PETH转账
                        </button>
                        <input
                            type="text"
                            value={addressPETHTrans}
                            onChange={handleAddressPETHTransChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addressPETHTransAmount}
                            onChange={handleAddressPETHTransAmountChange}
                            placeholder="Enter trans amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>
                    <div className='single-border'>
                        <button onClick={transferPUSDTHandler}  className='btn'>
                            PUSDT转账
                        </button>
                        <input
                            type="text"
                            value={addressPUSDTTrans}
                            onChange={handleAddressPUSDTTransChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addressPUSDTTransAmount}
                            onChange={handleAddressPUSDTTransAmountChange}
                            placeholder="Enter trans amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>

                    {/* Approve */}
                    <div className='single-border'>
                        <button onClick={approvePETHHandler}  className='btn'>
                            PETH授权
                        </button>
                        <input
                            type="text"
                            value={addressPETHApprove}
                            onChange={handleAddressPETHApproveChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addressPETHApproveAmount}
                            onChange={handleAddressPETHApproveAmountChange}
                            placeholder="Enter trans amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>
                    <div className='single-border'>
                        <button onClick={approvePUSDTHandler}  className='btn'>
                            PUSDT授权
                        </button>
                        <input
                            type="text"
                            value={addressPUSDTApprove}
                            onChange={handleAddressPUSDTApproveChange}
                            placeholder="Enter Ethereum address"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addressPUSDTApproveAmount}
                            onChange={handleAddressPUSDTApproveAmountChange}
                            placeholder="Enter trans amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>
                </div>

                <hr></hr>

                {/* LPSwap相关 */}
                <div className='clip-border'>
                    <h4>LPSwap相关</h4>
                    
                    {/* 添加流动性 */}
                    <div className='single-border'>
                        <button onClick={addLiquidity}  className='btn'>
                            添加流动性
                        </button>
                        <input
                            type="text"
                            value={token1Amount}
                            onChange={handleToken1AmountChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={token2Amount}
                            onChange={handleToken2AmountChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>

                    {/* 查看价格 */}
                    <div className='single-border'>
                        <button onClick={getPrice}  className='btn'>
                            查询价格
                        </button>
                        <input
                            type="text"
                            value={newPrice}
                            onChange={handleNewPriceChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        {userPETHBalLP && <span>余额: {userPETHBalLP}</span>}
                    </div>

                    {/* 交换代币 */}
                    <div className='single-border'>
                        <button onClick={swapToken}  className='btn'>
                            Swap
                        </button>
                        <input
                            type="text"
                            value={swapTokenAddress}
                            onChange={handleSwapTokenAddressChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={swapTokenAmount}
                            onChange={handleSwapTokenAmountChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        {userSwapAmount && <span>余额: {userSwapAmount}</span>}
                    </div>
                    
                </div>

                <hr></hr>

                {/* DefiLendingDapp相关 */}
                <div className='clip-border'>
                    <h4>DefiLendingDapp相关</h4>
                    
                    {/* addToken */}
                    <div className='single-border'>
                        <button onClick={addTokenToDLP}  className='btn'>
                            添加代币
                        </button>
                        <input
                            type="text"
                            value={addTokenAddress}
                            onChange={handleAddTokenAddressChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addTokenAddressRate}
                            onChange={handleAddTokenAddressRateChange}
                            placeholder="Enter rate"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addTokenAddressFactor}
                            onChange={handleAddTokenAddressFactorChange}
                            placeholder="Enter factor"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>

                    {/* setPrice */}
                    <div className='single-border'>
                        <button onClick={setPriceToDLP}  className='btn'>
                            设置价格
                        </button>
                        <input
                            type="text"
                            value={setPriceAddress}
                            onChange={handleSetPriceAddressChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={setPricePrice}
                            onChange={handleSetPricePriceChange}
                            placeholder="Enter price"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />

                    </div>

                    {/* deposit */}
                    <div className='single-border'>
                        <button onClick={addDeposit}  className='btn'>
                            存款
                        </button>
                        <input
                            type="text"
                            value={addDepositAddress}
                            onChange={handleaddDepositAddressChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={addDepositAmount}
                            onChange={handleaddDepositAmountChange}
                            placeholder="Enter price"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>

                    <div className='single-border'>
                        <button onClick={withdrawMoney}  className='btn'>
                            取款
                        </button>
                        <input
                            type="text"
                            value={withdrawMoneyAddress}
                            onChange={handleWithdrawMoneyAddressChange}
                            placeholder="Enter token amount"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                        <input
                            type="text"
                            value={withdrawMoneyAmount}
                            onChange={handleWithdrawMoneyAmountChange}
                            placeholder="Enter price"
                            style={{ padding: '8px', marginRight: '10px' }}
                            className='input-text' 
                        />
                    </div>
                    
                </div>

                <hr></hr>

            </div>
    )}

    // ============================================================== 处理函数

    // swap
    const swapToken = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
        
            if (ethereum) {  // ethereum对象存在
        
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractLPSwapAddress, abiLPSwap, signer);
    
                // 发送 mint 交易
                const token1Amount_format = ethers.parseUnits(swapTokenAmount.toString(), precision);
                const bal = await tokenContract.swap(swapTokenAddress, token1Amount_format);
                
                // 等待交易被确认
                console.log("withdraw... Please wait...");

                setUserSwapAmount(ethers.formatUnits(bal.toString(), 18));
        
            } else {
                console.log("Ethereum object does not exist");
            }
        
            } catch (err) {
                console.log(err);
            }
    };

    // 获取价格
    const getPrice = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
        
            if (ethereum) {  // ethereum对象存在
        
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractLPSwapAddress, abiLPSwap, signer);
    
                // 发送 mint 交易
                const bal = await tokenContract.getPrice();
                
                // 等待交易被确认
                console.log("withdraw... Please wait...");

                setNewPriceShow(ethers.formatUnits(bal.toString(), 18));
        
            } else {
                console.log("Ethereum object does not exist");
            }
        
            } catch (err) {
                console.log(err);
            }
    };

    // 添加流动性
    const addLiquidity = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
        
            if (ethereum) {  // ethereum对象存在
        
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractLPSwapAddress, abiLPSwap, signer);
    
                // 发送 mint 交易
                const token1Amount_format = ethers.parseUnits(token1Amount.toString(), precision);
                const token2Amount_format = ethers.parseUnits(token1Amount.toString(), precision);
                const mintTx = await tokenContract.addLiquidity(token1Amount_format, token2Amount_format);
                
                // 等待交易被确认
                console.log("withdraw... Please wait...");
                await mintTx.wait();
        
            } else {
                console.log("Ethereum object does not exist");
            }
        
            } catch (err) {
                console.log(err);
            }
    };

    // 取款
    const withdrawMoney = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
      
            if (ethereum) {  // ethereum对象存在
      
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractDefiLendingDappAddress, abiDefiLendingDapp, signer);
    
                // 发送 mint 交易
                const interestRate_format = ethers.parseUnits(withdrawMoneyAmount.toString(), precision);
                const mintTx = await tokenContract.withdraw(withdrawMoneyAddress, interestRate_format);
                
                // 等待交易被确认
                console.log("withdraw... Please wait...");
                await mintTx.wait();
      
            } else {
                console.log("Ethereum object does not exist");
            }
      
          } catch (err) {
              console.log(err);
          }
    };

    // 存款
    const addDeposit = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
      
            if (ethereum) {  // ethereum对象存在
      
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractDefiLendingDappAddress, abiDefiLendingDapp, signer);
    
                // 发送 mint 交易
                const interestRate_format = ethers.parseUnits(addDepositAmount.toString(), precision);
                const mintTx = await tokenContract.deposit(addDepositAddress, interestRate_format);
                
                // 等待交易被确认
                console.log("addToken... Please wait...");
                await mintTx.wait();
      
            } else {
                console.log("Ethereum object does not exist");
            }
      
          } catch (err) {
              console.log(err);
          }
    };

    // 设置DLP代币价格
    const setPriceToDLP = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
      
            if (ethereum) {  // ethereum对象存在
      
              // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
              const provider = await new ethers.BrowserProvider(ethereum);
              // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
              const signer = await provider.getSigner();
              // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
              const tokenContract = new ethers.Contract(contractDefiLendingDappAddress, abiDefiLendingDapp, signer);
  
              // 发送 mint 交易
              const interestRate_format = ethers.parseUnits(setPricePrice.toString(), precision);
              const mintTx = await tokenContract.setTokenPrice(setPriceAddress, interestRate_format);
              
              // 等待交易被确认
              console.log("addToken... Please wait...");
              await mintTx.wait();
      
            } else {
              console.log("Ethereum object does not exist");
            }
      
          } catch (err) {
              console.log(err);
          }
    };
    // DLP添加代币
    const addTokenToDLP = async () => {
        try {
            // 得到由Metamask注入的ethereum对象
            const { ethereum } = window;
      
            if (ethereum) {  // ethereum对象存在
      
              // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
              const provider = await new ethers.BrowserProvider(ethereum);
              // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
              const signer = await provider.getSigner();
              // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
              const tokenContract = new ethers.Contract(contractDefiLendingDappAddress, abiDefiLendingDapp, signer);
  
              // 发送 mint 交易
              const interestRate_format = ethers.parseUnits(mintPETHAmount.toString(), precision);
              const collateralFactor_format = ethers.parseUnits(mintPETHAmount.toString(), precision);
              const mintTx = await tokenContract.addToken(addTokenAddress, interestRate_format, collateralFactor_format);
              
              // 等待交易被确认
              console.log("addToken... Please wait...");
              await mintTx.wait();
      
            } else {
              console.log("Ethereum object does not exist");
            }
      
          } catch (err) {
              console.log(err);
          }
    };


    // 链接metamash处理函数
    const connectWalletHandler = async () => {
        // 检查是否安装了Metamask。如果没有，网站会显示一个弹出窗口，要求安装Metamask
        const { ethereum } = window;
        if (!ethereum) {
            alert("Please install Metamask!");
        }

        // 链接钱包
        try {
            // 请求Metamask提供用户的钱包地址（ 请求账户访问权限）
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Found an account! Address: ", accounts);

            // 用户同意与网站连接，它将获取第一个可用的钱包地址，并将其作为currentAccount变量的值。
            setCurrentAccount(accounts[0]);
        } catch (err) {
            console.log(err)  // 出了问题（比如用户拒绝连接），它就会失败，并在控制台打印出错误信息
        }

    }

    // mint
    const ownerMintPETHHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
            // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
            const provider = await new ethers.BrowserProvider(ethereum);
            // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
            const signer = await provider.getSigner();
            // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
            const tokenContract = new ethers.Contract(contractPETHAddress, abiMyERC20Token, signer);

            // 发送 mint 交易
            const format_amount = ethers.parseUnits(mintPETHAmount.toString(), precision);
            const mintTx = await tokenContract.mint(addressMintPETH, format_amount);
            
            // 等待交易被确认
            console.log("Minting... Please wait...");
            await mintTx.wait();
            
            // 监听 mint 提交的事件
            tokenContract.on("Mint", (addressMintPETH, format_amount) => {
                // 弹出提示框
                window.alert(`Success! Minted ${ethers.formatUnits(mintPETHAmount.toString(), 18)} tokens to ${addressMintPETH}`);
            });
    
          } else {
            console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
            console.log(err);
        }
    };
    const ownerMintPUSDTHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
            // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
            const provider = await new ethers.BrowserProvider(ethereum);
            // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
            const signer = await provider.getSigner();
            // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
            const tokenContract = new ethers.Contract(contractPUSDTAddress, abiMyERC20Token, signer);

            // 发送 mint 交易
            const format_amount = ethers.parseUnits(mintPUSDTAmount.toString(), precision);
            const mintTx = await tokenContract.mint(addressMintPUSDT, format_amount);
            
            // 等待交易被确认
            console.log("Minting... Please wait...");
            await mintTx.wait();
            
            // 监听 mint 提交的事件
            tokenContract.on("Mint", (addressMintPUSDT, format_amount) => {
                // 弹出提示框
                window.alert(`Success! Minted ${ethers.formatUnits(mintPUSDTAmount.toString(), 18)} tokens to ${addressMintPUSDT}`);
            });
    
          } else {
            console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
            console.log(err);
        }
    };

    // bal
    const getUserPETHBalHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
            // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
            const provider = await new ethers.BrowserProvider(ethereum);
            // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
            const signer = await provider.getSigner();
            // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
            const tokenContract = new ethers.Contract(contractPETHAddress, abiMyERC20Token, signer);
    
            // 调用
            const bal = await tokenContract.balanceOf(addressPETHBal);
    
            setUserPETHBal(ethers.formatUnits(bal.toString(), 18));
    
          } else {
            console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
          console.log(err);
        }
    }
    const getUserPUSDTBalHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
            // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
            const provider = await new ethers.BrowserProvider(ethereum);
            // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
            const signer = await provider.getSigner();
            // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
            const tokenContract = new ethers.Contract(contractPUSDTAddress, abiMyERC20Token, signer);
    
            // 调用
            const bal = await tokenContract.balanceOf(addressPUSDTBal);
    
            setUserPUSDTBal(ethers.formatUnits(bal.toString(), 18));
    
          } else {
            console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
          console.log(err);
        }
    }

    // trans
    const transferPETHHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractPETHAddress, abiMyERC20Token, signer);
        
                // 发送 mint 交易
                const format_amount = ethers.parseUnits(addressPETHTransAmount.toString(), precision);
                const mintTx = await tokenContract.Transfer(addressPETHTrans, format_amount);
            
                // 等待交易被确认
                console.log("Transfer... Please wait...");
                await mintTx.wait();
    
          } else {
                console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
            console.log(err);
        }
    } 
    const transferPUSDTHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractPUSDTAddress, abiMyERC20Token, signer);
        
                // 发送 mint 交易
                const format_amount = ethers.parseUnits(addressPUSDTTransAmount.toString(), precision);
                const mintTx = await tokenContract.Transfer(addressPUSDTTrans, format_amount);
            
                // 等待交易被确认
                console.log("Transfer... Please wait...");
                await mintTx.wait();
    
          } else {
                console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
            console.log(err);
        }
    } 

    // approve
    const approvePETHHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractPETHAddress, abiMyERC20Token, signer);
        
                // 发送 mint 交易
                const format_amount = ethers.parseUnits(addressPETHApproveAmount.toString(), precision);
                const mintTx = await tokenContract.approve(addressPETHApprove, format_amount);
            
                // 等待交易被确认
                console.log("Transfer... Please wait...");
                await mintTx.wait();
    
          } else {
                console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
            console.log(err);
        }
    } 
    const approvePUSDTHandler = async() => {
        try {
          // 得到由Metamask注入的ethereum对象
          const { ethereum } = window;
    
          if (ethereum) {  // ethereum对象存在
    
                // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
                const provider = await new ethers.BrowserProvider(ethereum);
                // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
                const signer = await provider.getSigner();
                // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
                const tokenContract = new ethers.Contract(contractPUSDTAddress, abiMyERC20Token, signer);
        
                // 发送 mint 交易
                const format_amount = ethers.parseUnits(addressPUSDTApproveAmount.toString(), precision);
                const mintTx = await tokenContract.approve(addressPUSDTApprove, format_amount);
            
                // 等待交易被确认
                console.log("Transfer... Please wait...");
                await mintTx.wait();
    
          } else {
                console.log("Ethereum object does not exist");
          }
    
        } catch (err) {
            console.log(err);
        }
    } 

    // ============================================================== 辅助函数      

    // addLiquidity
    const handleSwapTokenAddressChange = (e) => {
        setSwapTokenAddress(e.target.value);
    };
    const handleSwapTokenAmountChange = (e) => {
        setSwapTokenAmount(e.target.value);
    };

    // addLiquidity
    const handleNewPriceChange = (e) => {
        setNewPrice(e.target.value);
    };

    // addLiquidity
    const handleToken1AmountChange = (e) => {
        setToken1Amount(e.target.value);
    };
    const handleToken2AmountChange = (e) => {
        setToken2Amount(e.target.value);
    };

    // withdraw
    const handleWithdrawMoneyAddressChange = (e) => {
        setWithdrawMoneyAddress(e.target.value);
    };
    const handleWithdrawMoneyAmountChange = (e) => {
        setWithdrawMoneyAmount(e.target.value);
    };

    // deposit
    const handleaddDepositAddressChange = (e) => {
        setAddDepositAddress(e.target.value);
    };
    const handleaddDepositAmountChange = (e) => {
        setAddDepositAmount(e.target.value);
    };

    // setPrice
    const handleSetPriceAddressChange = (e) => {
        setSetPriceAddress(e.target.value);
    };
    const handleSetPricePriceChange = (e) => {
        setSetPricePrice(e.target.value);
    };

    // addToken
    const handleAddTokenAddressChange = (e) => {
        setAddTokenAddress(e.target.value);
    };
    const handleAddTokenAddressRateChange = (e) => {
        setAddTokenAddressRate(e.target.value);
    };
    const handleAddTokenAddressFactorChange = (e) => {
        setAddTokenAddressFactor(e.target.value);
    };

    // mint
    const handleAddressMintPETHChange = (e) => {
        setAddressMintPETH(e.target.value);
    };
    const handlemMintPETHAmountChange = (e) => {
        setMintPETHAmount(e.target.value);
    };
    const handleAddressMintPUSDTChange = (e) => {
        setAddressMintPUSDT(e.target.value);
    };
    const handlemMintPUSDTAmountChange = (e) => {
        setMintPUSDTAmount(e.target.value);
    };
    // bal
    const handleAddressPETHBalChange = (e) => {
        setAddressPETHBal(e.target.value);
    };
    const handleAddressPUSDTBalChange = (e) => {
        setAddressPUSDTBal(e.target.value);
    };
    // trans
    const handleAddressPETHTransChange = (e) => {
        setAddressPETHTrans(e.target.value);
    };
    const handleAddressPETHTransAmountChange = (e) => {
        setAddressPETHTransAmount(e.target.value);
    };
    const handleAddressPUSDTTransChange = (e) => {
        setAddressPUSDTTrans(e.target.value);
    };
    const handleAddressPUSDTTransAmountChange = (e) => {
        setAddressPUSDTTransAmount(e.target.value);
    };
    // approve
    const handleAddressPETHApproveChange = (e) => {
        setAddressPETHApprove(e.target.value);
    };
    const handleAddressPETHApproveAmountChange = (e) => {
        setAddressPETHApproveAmount(e.target.value);
    };
    const handleAddressPUSDTApproveChange = (e) => {
        setAddressPUSDTApprove(e.target.value);
    };
    const handleAddressPUSDTApproveAmountChange = (e) => {
        setAddressPUSDTApproveAmount(e.target.value);
    };

    // ============================================================== 状态函数
    // 切换到 Sepolia 网络
    const switchToSepoliaHandler = async () => {
        const { ethereum } = window;

        if (ethereum) {
            // 如果当前网络不是 Sepolia 网络，则切换到 Sepolia
            if (currentChainId !== '0xaa36a7') {
                console.log("Switching to Sepolia network...");

                try {
                // 切换到 Sepolia 网络
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }],
                });
                console.log("Successfully switched to Sepolia network");
                } catch (switchError) {
                console.log(switchError.code);
                }
            }else{
                console.log("Already on Sepolia network.");
            }   
        }  
    };

    // 检查链接网络的chainId
    const checkNetwork = async () => {
        const { ethereum } = window;

        if (ethereum) {
            try {
                // 得到当前网络的chainId
                const chainId = await ethereum.request({ method: 'eth_chainId' });

                // 设置chainId
                setCurrentChainId(chainId);
            } catch (error) {
                console.error("Error checking network:", error);
            }
        } else {
            console.log("MetaMask is not installed.");
        }
    };

    // 检查Metamask钱包是否存在，并且如果钱包已经链接了该网站则自动链接钱包的第一个账户
    const checkWalletIsConnected = async() => {
        // Metamask会将一个ethereum对象注入你的浏览器的全局window对象中
        const { ethereum } = window;  // 取出 ethereum 

        // 检查Metamask钱包是否存在
        if (!ethereum) {
            console.log("Make sure you have Metamask installed!");
            return;
        } else {
            console.log("Wallet exists! We're ready to go!")
        }

        // 在网站加载时立即检查账户，如果钱包已经连接，则设置currentAccount。
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account: ", account);
            setCurrentAccount(account);
        } else {
            console.log("No authorized account found");
        }

    }

    // 钩子函数：组件每渲染一次，该函数就自动执行一次。
    useEffect(() => {
        // 自动链接钱包
        checkWalletIsConnected();
        // 检查链接网络的chainId
        checkNetwork();
    }, [])

    return (
        <div className='main-app'>
            
            {/* 保证链接到sepolia */}
            <div>
                <button onClick={switchToSepoliaHandler}>
                    切换网络
                </button>

                <span>
                { currentChainId=="0xaa36a7" ? "sepolia" : "others" }
                </span>
            </div>

            <div>
                { currentAccount ? connectedPage() : connectWalletButton() }
            </div>

        </div>
    );
}


export default App;