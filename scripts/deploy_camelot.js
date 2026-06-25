// Script to deploy CamelotScavengerDeployable contract
const ethers = require('ethers');

async function deployContract() {
    // Connect to the Remix VM provider
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Use the first account
    const accounts = await provider.listAccounts();
    const signer = provider.getSigner(accounts[0]);
    
    console.log('Deploying from account:', accounts[0]);
    
    // Read the contract ABI and bytecode
    const contractArtifact = require('../artifacts/CamelotScavengerDeployable.json');
    const abi = contractArtifact.abi;
    const bytecode = contractArtifact.data.bytecode.object;
    
    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    
    // Deploy the contract
    console.log('Deploying CamelotScavengerDeployable...');
    const contract = await factory.deploy();
    
    console.log('Contract deployed!');
    console.log('Transaction hash:', contract.deployTransaction.hash);
    console.log('Contract address:', contract.address);
    
    // Wait for deployment to be mined
    await contract.deployed();
    console.log('Deployment confirmed at address:', contract.address);
}

deployContract().catch(console.error);
