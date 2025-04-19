import { useEffect, useState } from 'react';
import './App.css';
import contract from "./contracts/MyErc20Token.json"
import { ethers } from 'ethers';

// 导入合约
const contractAddress = "0x3CA742d5FE996133917C714D032CF1c04FE70a17";
const abi = contract.abi;  // abi


function App() {

  // useState：钩子函数，让函数组件也可以有 state 状态
  //    声明一个叫 "currentAccount" 的 state 变量（可以使用setCurrentAccount更新），用于跟踪用户的钱包地址。
  const [currentAccount, setCurrentAccount] = useState(null);   
  // 当前链接网络的chainId
  const [currentChainId, setCurrentChainId] = useState(null);


  const [totalSupply, setTotalSupply] = useState(null);

  const [addressBal, setAddressBal] = useState(null); 
  const [userBal, setUserBal] = useState(null);

  const [addressApprove, setAddressApprove] = useState(null); 
  const [userApproveBal, setUserApproveBal] = useState(null);

  const [addressMint, setAddressMint] = useState(null); 
  const [mintAmountOwner, setMintAmountOwner] = useState(null);

  const [addressTrans, setAddressTrans] = useState(null); 
  const [addressTransAmount, setAddressTransAmount] = useState(null);


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

      <div className='border-app' >
      
      {currentAccount && (
        <div>
          <p>已连接钱包地址: {currentAccount}</p>
        </div>
      )}

      <div className='single-border'>
        <button onClick={getTotalSupplyHandler} className='btn'>
        总供应量
        </button>

        {totalSupply && <span>总供应量: {totalSupply}</span>}
      </div>

      <div className='single-border'>
        <button onClick={getUserBalHandler} className='btn'>
          余额查询
        </button>

        <input
          type="text"
          value={addressBal}
          onChange={handleAddressBalChange}
          placeholder="Enter Ethereum address"
          style={{ padding: '8px', marginRight: '10px' }}
          className='input-text' 
        />

        {userBal && <span>余额: {userBal}</span>}
      </div>

      <div className='single-border'>
        <button onClick={getApproveBalHandler} className='btn'>
          授权余额查询
        </button>

        <input
          type="text"
          value={addressApprove}
          onChange={handleAddressApproveChange}
          placeholder="Enter Ethereum address"
          style={{ padding: '8px', marginRight: '10px' }}
          className='input-text' 
        />

        {userApproveBal && <span>授权余额: {userApproveBal}</span>}
      </div>

      <div className='single-border'>
        <button onClick={getMintOwnerHandler} className='btn'>
          Mint
        </button>

        <input
          type="text"
          value={addressMint}
          onChange={handleAddressMintChange}
          placeholder="Enter Ethereum address"
          style={{ padding: '8px', marginRight: '10px' }}
          className='input-text' 
        />
      
        <input
          type="text"
          value={mintAmountOwner}
          onChange={handlemMintAmountOwnerChange}
          placeholder="Enter mint amount"
          style={{ padding: '8px', marginRight: '10px' }}
          className='input-text' 
        />

      </div>
      
      <div className='single-border'>
        <button onClick={transferHandler} className='btn'>
          transfer
        </button>

        <input
          type="text"
          value={addressTrans}
          onChange={handleAddressTransChange}
          placeholder="Enter Ethereum address"
          style={{ padding: '8px', marginRight: '10px' }}
          className='input-text' 
        />


        <input
          type="text"
          value={addressTransAmount}
          onChange={handleAddressTransAmountChange}
          placeholder="Enter trans amount"
          style={{ padding: '8px', marginRight: '10px' }}
          className='input-text' 
        />

      </div>

    </div>

  )}


  // ============================================================== 处理函数
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

  // getTotalSupply
  const getTotalSupplyHandler = async() => { 
    try {
      // 得到由Metamask注入的ethereum对象
      const { ethereum } = window;

      if (ethereum) {  // ethereum对象存在

        // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
        const provider = await new ethers.BrowserProvider(ethereum);
        // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
        const signer = await provider.getSigner();
        // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
        const tokenContract = new ethers.Contract(contractAddress, abi, signer);

        // 直接访问 _totalSupply 变量
        const _totalSupply = await tokenContract._totalSupply();

        // // 打印totalSupply的结果
        // console.log("Total Supply: ", totalSupply);  // 假设是18位小数

        setTotalSupply(_totalSupply);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const handleAddressBalChange = (e) => {
    setAddressBal(e.target.value);
  };

  const getUserBalHandler = async() => {
    try {
      // 得到由Metamask注入的ethereum对象
      const { ethereum } = window;

      if (ethereum) {  // ethereum对象存在

        // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
        const provider = await new ethers.BrowserProvider(ethereum);
        // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
        const signer = await provider.getSigner();
        // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
        const tokenContract = new ethers.Contract(contractAddress, abi, signer);

        //
        const bal = await tokenContract._balanceOfUser(addressBal);

        // // 打印totalSupply的结果
        // console.log("Total Supply: ", totalSupply);  // 假设是18位小数

        setUserBal(bal);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const handleAddressApproveChange = (e) => {
    setAddressApprove(e.target.value);
  };

  const getApproveBalHandler = async() => {
    try {
      // 得到由Metamask注入的ethereum对象
      const { ethereum } = window;

      if (ethereum) {  // ethereum对象存在

        // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
        const provider = await new ethers.BrowserProvider(ethereum);
        // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
        const signer = await provider.getSigner();
        // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
        const tokenContract = new ethers.Contract(contractAddress, abi, signer);

        // 
        const bal = await tokenContract._balanceOfApprove(addressApprove);

        // // 打印totalSupply的结果
        // console.log("Total Supply: ", totalSupply);  // 假设是18位小数

        setUserApproveBal(bal);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  };

  const handleAddressMintChange = (e) => {
    setAddressMint(e.target.value);
  };

  const handlemMintAmountOwnerChange = (e) => {
    setMintAmountOwner(e.target.value);
  };

  const getMintOwnerHandler = async() => {
    try {
      // 得到由Metamask注入的ethereum对象
      const { ethereum } = window;

      if (ethereum) {  // ethereum对象存在

        // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
        const provider = await new ethers.BrowserProvider(ethereum);
        // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
        const signer = await provider.getSigner();
        // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
        const tokenContract = new ethers.Contract(contractAddress, abi, signer);

        // 发送 mint 交易
        const mintTx = await tokenContract._ownerMint(addressMint, mintAmountOwner);
      
        // 等待交易被确认
        console.log("Minting... Please wait...");
        await mintTx.wait();

        // 监听 _ownerMint 提交的事件
        tokenContract.on("emitTransfer", (currentAccount, addressMint, mintAmountOwner) => {
          // 弹出提示框
          window.alert(`Success! Minted ${mintAmountOwner} tokens from ${currentAccount} to ${addressMint}`);
        });

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  };


  const handleAddressTransChange = (e) => {
    setAddressTrans(e.target.value);
  };

  const handleAddressTransAmountChange = (e) => {
    setAddressTransAmount(e.target.value);
  };

  const transferHandler = async() => {
    try {
      // 得到由Metamask注入的ethereum对象
      const { ethereum } = window;

      if (ethereum) {  // ethereum对象存在

        // 将Metamask设置为RPC提供者。这意味着，将使用Metamask钱包向矿工发出请求。
        const provider = await new ethers.BrowserProvider(ethereum);
        // 为了发出交易请求，用户需要使用他们的私钥签署交易。因此获取签名器。
        const signer = await provider.getSigner();
        // 使用部署的合约的地址、合约ABI和签名者创建一个合约实例
        const tokenContract = new ethers.Contract(contractAddress, abi, signer);

        // 发送 mint 交易
        const mintTx = await tokenContract._transfer(addressTrans, addressTransAmount);
      
        // 等待交易被确认
        console.log("Transfer... Please wait...");
        await mintTx.wait();

        // 监听 _ownerMint 提交的事件
        tokenContract.on("emitTransfer", (currentAccount, addressTrans, addressTransAmount) => {
          // 弹出提示框
          window.alert(`Success Transfer ${mintAmountOwner} tokens from ${currentAccount} to ${addressMint}`);
        });

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  } 


  // ============================================================== 辅助函数
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

  // 钩子函数：组件每渲染一次，该函数就自动执行一次。
  useEffect(() => {
    // 自动链接钱包
    checkWalletIsConnected();
    // 检查链接网络的chainId
    checkNetwork();
  }, [])

  

  return (
    <div className='main-app'>
      <h1>MyErc20Token Dapp</h1>

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
