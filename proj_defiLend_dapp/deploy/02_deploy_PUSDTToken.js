const { getNamedAccounts, deployments, network } = require('hardhat')
const { developmentChains, CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async() => {
    // getNamedAccounts：hre中拿到的内容，他可以拿到namedAccounts中的所有账户
    // deployments：hre中拿到的内容，他可以根据合约名字拿到所有部署过的合约

    const { firstAccount } = await getNamedAccounts();  // 拿到第一个账户
    const { deploy } = deployments;  // 拿到所有部署过的合约dict

    // 根据部署网络的不同拿到不同参数
    let confirmations
    if(developmentChains.includes(network.name)){  // 本地环境
        confirmations = 0  // 模拟网络不用等待区块确认，因为不会有延时
    }else{  // 线上环境
        confirmations = CONFIRMATIONS
    }

    // 对合约进行部署
    console.log("\ndeploy PUSDTToken start......")
    const myPUSDTToken = await deploy("PUSDTToken", {
        contract: "MyERC20Token",  // 指定合约类名
        from: firstAccount,  // 那个账户进行部署
        args: ["PUSDTToken", "PUSDT"],  // 部署时传入的参数
        log: true,  // 是否需要打印参数
        waitConfirmations: confirmations  // 不同网络使用不同确认数量
    })

    // 加上验证
    if( hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API ) {
        // 将验证的内容写入代码自动进行验证
        await hre.run("verify:verify", {  // hre是运行时环境，其实就是js执行命令行脚本
            address: myPUSDTToken.address,  // 合约地址
            constructorArguments: ["PUSDTToken", "PUSDT"],  // 输入参数
        });
    }else{
        console.log(`local verify skip`)
    }

    console.log("deploy PUSDTToken finished.")
}

// 给当前部署的合约一个标签
module.exports.tags = ["all", "PUSDTToken"]
