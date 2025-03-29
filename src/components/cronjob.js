const BACKEND_URL = "https://rag-backend-zh2e.onrender.com";

// Object to track last activity time for each username
const userLastActivity = new Map();

// Function to update user's last activity time and start summarize job if not running
const updateUserActivity = (username) => {
  userLastActivity.set(username, Date.now());

  // If summarize job is not already running for this user, start it
  if (!userLastActivity.has(`running_${username}`)) {
    startSummarizeJob(username);
  }
};

// Function to check if user has been inactive for 5 minutes
const isUserInactive = (username) => {
  const lastActive = userLastActivity.get(username);
  if (!lastActive) return true; // If no activity recorded, consider inactive
  const fiveMinutes = 1 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() - lastActive >= fiveMinutes;
};

// Function to call the /summarize endpoint for a specific username
const callSummarize = async (username) => {
  try {
    if (!isUserInactive(username)) {
      console.log(`Skipping summarize for ${username} - user still active`);
      return;
    }

    const response = await fetch(`${BACKEND_URL}/summarize?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      console.error(`Failed to call /summarize for ${username}: ${response.status}`);
      return;
    }
    const data = await response.json();
    console.log(`Summarize response for ${username}:`, data);

    // Remove user from tracking after summarization
    userLastActivity.delete(username);
    userLastActivity.delete(`running_${username}`);
  } catch (error) {
    console.error(`Error calling /summarize for ${username}:`, error);
  }
};

// Function to start the summarize job for a specific user (runs only when a user exists)
const startSummarizeJob = (username) => {
  if (!username) return;
  userLastActivity.set(`running_${username}`, true); // Mark that this job is running

  const summarizeInterval = 60 * 1000; // 1 minute in milliseconds
  const intervalId = setInterval(() => {
    if (!userLastActivity.has(username)) {
      clearInterval(intervalId); // Stop checking if the user has been removed
      return;
    }
    callSummarize(username);
  }, summarizeInterval);
};

// Function to call the /status endpoint (runs in the background)
const callStatus = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      console.error(`Failed to call /status: ${response.status}`);
      return;
    }
    const data = await response.json();
    console.log("Status response:", data);
  } catch (error) {
    console.error("Error calling /status:", error);
  }
};

// Function to start the background status job (runs continuously)
const startStatusJob = () => {
  callStatus();
  const statusInterval = 30000;//5 * 60 * 1000; // 5 minutes
  setInterval(callStatus, statusInterval);
};

// Export functions for external use
export { startStatusJob, updateUserActivity };
