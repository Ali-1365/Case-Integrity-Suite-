import { geminiService, offlineService } from '../services/geminiService';
import { getSyntheticResponse } from '../lib/syntheticLLMResponses';

async function runTests() {
  console.log("Starting tests for GeminiService and OfflineService...\n");

  // TEST 1: checkApiStatus offline bypass
  console.log("--- TEST 1: checkApiStatus offline bypass ---");
  // Force offline
  offlineService.setOffline(true, 'MANUAL');
  console.log("Is Offline?", offlineService.getIsOffline());

  // Call checkApiStatus - since no API key, should fail, but not trigger synthetic response
  const status = await geminiService.checkApiStatus();
  console.log("API Status result:", status.online, status.message);
  console.log("Is Offline after checkApiStatus?", offlineService.getIsOffline());

  // TEST 2: generate in offline mode
  console.log("\n--- TEST 2: generate in offline mode ---");
  offlineService.setOffline(true, 'NETWORK_ERROR');
  const syntheticResponse = await geminiService.generate({ contents: 'Test prompt' }, 'fast');
  console.log("Received synthetic response:", syntheticResponse.substring(0, 50) + '...');

  // TEST 3: embed in offline mode
  console.log("\n--- TEST 3: embed in offline mode ---");
  const pseudoEmbed = await geminiService.embed("Test prompt");
  console.log("Received pseudo embed of length:", pseudoEmbed.length);

  console.log("\nAll tests ran successfully!");
}

runTests().catch(console.error);
