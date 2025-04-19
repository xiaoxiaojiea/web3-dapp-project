const { expect } = require("chai")
const { ethers, deployments, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")


// 本地网络才执行这个测试
!developmentChains.includes(network.name)  // 如果本地网络标识包含当前使用的网络，则表示使用的本地网络测试
? describe.skip
:describe("test MyErc20Token contract", async function() {  // describe（注释，函数）：测试用例的开始
    
    let myErc20Token  // 第一个合约
    let firstAccount  // 第一个账户

    let myErc20Token_second  // 第一个合约
    let secondAccount  // 第二个账户

    // 两个账户的签名（用来指定调用某个合约的签名）
    let firstAccountSigner;
    let secondAccountSigner;

    // beforeEach：每个it之前都要执行一遍
    beforeEach(async function(){
        // 加载并执行名为 "all" 的部署任务（就是 tags 中设置的）。（保证合约在每次调用之前都是从新开始的合约）
        await deployments.fixture("all")
        
        // getNamedAccounts() 是 Hardhat 提供的工具，用来获取在 hardhat.config.js 文件中配置的账户。
        firstAccount = (await getNamedAccounts()).firstAccount;  // 拿到第一个账户
        secondAccount = (await getNamedAccounts()).secondAccount;  // 拿到第二个账户

        /**
         * ethers.getContractAt()：
         *      通过 合约地址 获取已部署合约的实例，合约实例将会默认绑定到当前的默认账户（通常是第一个账户）。
         * ethers.getContract()：
         *      通过 合约名称 直接从 Hardhat 的部署记录中获取合约实例，并绑定指定的 Signer（这里是 secondAccount）。
         */

        // 通过 Hardhat 的 deployments 工具获取名为 MyErc20Token 的已部署合约对象。（MyErc20Token 是你在部署脚本中定义的合约名称）
        const myErc20TokeneDeployment = await deployments.get("MyErc20Token")  // 取出合约 **对象**

        // 通过 ethers.getContractAt 方法获取这个已部署合约的实例。
        myErc20Token = await ethers.getContractAt("MyErc20Token", myErc20TokeneDeployment.address)  // 获取这个已部署合约的 **实例**
        
        // ethers.getContract 方法会默认将合约与指定的账户（这里是 secondAccount）绑定
        myErc20Token_second = await ethers.getContract("MyErc20Token", secondAccount)  // 部署新的合约 **实例**

        // ******************** 获取 Account 的 Signer ********************
        firstAccountSigner = await ethers.getSigner(firstAccount);  // 不获取的话无法设置到 connect 中
        secondAccountSigner = await ethers.getSigner(secondAccount);
    })

    // =============================== _ownerMint()
    // 仅 owner 可以调用
    it("_ownerMint(): only owner.", async function(){
        await myErc20Token.waitForDeployment();
        
        /** ******************************************************
         * connect：设置调用 合约实例 的账户（如果不设置则默认使用第一个账户）
         *********************************************************/
        await expect(myErc20Token.connect(secondAccountSigner)
            ._ownerMint(firstAccount, 100))
            .to.be.revertedWith("only owner can do it!");
    })

    // mint总量达到
    it("_ownerMint(): totalSupply is reach.", async function(){
        await myErc20Token.waitForDeployment();

        await expect(myErc20Token.connect(firstAccountSigner)
            ._ownerMint(firstAccount, 10001))
            .to.be.revertedWith("totalSupply is reach!");
    })

    // 正常mint（owner给自己mint）
    it("_ownerMint(): success mint.", async function(){
        await myErc20Token.waitForDeployment();

        await expect(myErc20Token.connect(firstAccountSigner)
            ._ownerMint(firstAccount, 500))
            .to.emit(myErc20Token, "emitTransfer")
            .withArgs(firstAccount, firstAccount, 500);
    })

    // 正常mint（owner给别人mint）
    it("_ownerMint(): success mint.", async function(){
        await myErc20Token.waitForDeployment();

        await expect(myErc20Token.connect(firstAccountSigner)
            ._ownerMint(secondAccount, 500))
            .to.emit(myErc20Token, "emitTransfer")
            .withArgs(firstAccount, secondAccount, 500);
    })

    // =============================== _approveMintBal()
    // 仅 owner 可以调用
    it("_approveMintBal(): only owner.", async function(){
        await myErc20Token.waitForDeployment();
        
        await expect(myErc20Token.connect(secondAccountSigner)
            ._approveMint(firstAccount, 100))
            .to.be.revertedWith("only owner can do it!");
    })

    // 正常 approve
    it("_approveMintBal(): success approve.", async function(){
        await myErc20Token.waitForDeployment();
        
        await expect(myErc20Token.connect(firstAccountSigner)
            ._approveMint(secondAccount, 100))
            .to.emit(myErc20Token, "emitApprove")
            .withArgs(firstAccount, secondAccount, 100);
    })

    // =============================== _userrMint()
    // 没有给账户 secondAccount 授权任何余额
    it("_userrMint(): approve balance is not enough.", async function(){
        await myErc20Token.waitForDeployment();

        // 没有给账户 secondAccount 授权任何余额
        
        await expect(myErc20Token.connect(secondAccountSigner)
            ._userrMint(100))
            .to.be.revertedWith("you have not be approved or approve balance is enough!");
    })

    // mint超过approve余额
    it("_userrMint(): _userrMint enough.", async function(){
        await myErc20Token.waitForDeployment();

        // 给账户 secondAccount 授权 500 余额
        await expect(myErc20Token.connect(firstAccountSigner)
            ._approveMint(secondAccount, 500))
            .to.emit(myErc20Token, "emitApprove")
            .withArgs(firstAccount, secondAccount, 500);
        
        await expect(myErc20Token.connect(secondAccountSigner)
            ._userrMint(501))
            .to.be.revertedWith("you have not be approved or approve balance is enough!");
    })

    // 正常 _userrMint
    it("_userrMint(): _userrMint success.", async function(){
        await myErc20Token.waitForDeployment();

        // 给账户 secondAccount 授权 500 余额
        await expect(myErc20Token.connect(firstAccountSigner)
            ._approveMint(secondAccount, 500))
            .to.emit(myErc20Token, "emitApprove")
            .withArgs(firstAccount, secondAccount, 500);
        
        await expect(myErc20Token.connect(secondAccountSigner)
            ._userrMint(300))
            .to.emit(myErc20Token, "emitTransfer")
            .withArgs(secondAccount, secondAccount, 300);
    })

    // =============================== _transfer()
    // sender balance is not enough
    it("_transfer(): balance is not enough.", async function(){
        await myErc20Token.waitForDeployment();

        await expect(myErc20Token.connect(firstAccountSigner)
            ._transfer(secondAccount, 500))
            .to.be.revertedWith("balance is not enough!");
    })

    // transfer success
    it("_transfer(): transfer success.", async function(){
        await myErc20Token.waitForDeployment();

        // mint
        await expect(myErc20Token.connect(firstAccountSigner)
            ._ownerMint(secondAccount, 500))
            .to.emit(myErc20Token, "emitTransfer")
            .withArgs(firstAccount, secondAccount, 500);

        await expect(myErc20Token_second.connect(secondAccountSigner)
            ._transfer(firstAccount, 400))
            .to.emit(myErc20Token_second, "emitTransfer")
            .withArgs(secondAccount, firstAccount, 400);
    })

    // =============================== _burn()
    // 燃烧成功
    it("_burn(): _burn success.", async function(){
        await myErc20Token.waitForDeployment();

        // mint
        await expect(myErc20Token.connect(firstAccountSigner)
            ._ownerMint(secondAccount, 500))
            .to.emit(myErc20Token, "emitTransfer")
            .withArgs(firstAccount, secondAccount, 500);

        // mint
        await expect(myErc20Token.connect(secondAccountSigner)
            ._burn(300))
            .to.emit(myErc20Token, "emitTransfer")
            .withArgs(secondAccount, ethers.ZeroAddress, 300);
    })

})



