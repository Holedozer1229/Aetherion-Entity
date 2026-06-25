// Script to deploy CamelotScavenger contract
import { deploy } from './ethers-lib'

(async () => {
  try {
    const result = await deploy('CamelotScavenger', [])
    console.log(`CamelotScavenger deployed at address: ${result.address}`)
  } catch (e) {
    console.log('Deployment error:', e.message)
  }
})()
