// Function to save user preferences to localStorage
function savePreferences() {
  // Get values from all form inputs
  const preferences = {
    timeOfDay: document.getElementById("timeOfDay").value,
    focusArea: document.getElementById("focusArea").value,
    timeAvailable: document.getElementById("timeAvailable").value,
    energyLevel: document.getElementById("energyLevel").value,
    activities: [],
  };

  // Get all checked activities
  const activityCheckboxes = document.querySelectorAll(
    'input[name="activities"]:checked'
  );
  activityCheckboxes.forEach((checkbox) => {
    preferences.activities.push(checkbox.value);
  });

  // Save preferences to localStorage as a JSON string
  localStorage.setItem("routinePreferences", JSON.stringify(preferences));
}

// Function to load user preferences from localStorage
function loadPreferences() {
  // Get saved preferences from localStorage
  const savedPreferences = localStorage.getItem("routinePreferences");

  // If no preferences are saved, exit the function
  if (!savedPreferences) {
    return;
  }

  // Parse the saved preferences from JSON string
  const preferences = JSON.parse(savedPreferences);

  // Set the dropdown values to the saved preferences
  document.getElementById("timeOfDay").value = preferences.timeOfDay;
  document.getElementById("focusArea").value = preferences.focusArea;
  document.getElementById("timeAvailable").value = preferences.timeAvailable;
  document.getElementById("energyLevel").value = preferences.energyLevel;

  // Check the saved activity checkboxes
  preferences.activities.forEach((activity) => {
    const checkbox = document.querySelector(
      `input[name="activities"][value="${activity}"]`
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

// Load saved preferences when the page loads
document.addEventListener("DOMContentLoaded", loadPreferences);

// Add an event listener to the form that runs when the form is submitted
document.getElementById("routineForm").addEventListener("submit", async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();

  // Save current preferences before generating routine
  savePreferences();

  // Get values from all form inputs and store them in variables
  const timeOfDay = document.getElementById("timeOfDay").value;
  const focusArea = document.getElementById("focusArea").value;
  const timeAvailable = document.getElementById("timeAvailable").value;
  const energyLevel = document.getElementById("energyLevel").value;

  // Get all checked activities from the checkbox group
  const selectedActivities = [];
  const activityCheckboxes = document.querySelectorAll(
    'input[name="activities"]:checked'
  );
  activityCheckboxes.forEach((checkbox) => {
    selectedActivities.push(checkbox.value);
  });

  // Create a user message with all the preferences
  const userMessage = `Please create a personalized daily routine based on these preferences:
- Time of day: ${timeOfDay}
- Focus area: ${focusArea}
- Time available: ${timeAvailable} minutes
- Energy level: ${energyLevel}
- Preferred activities: ${
    selectedActivities.length > 0
      ? selectedActivities.join(", ")
      : "None selected"
  }

Please provide a structured, step-by-step routine that fits these parameters and can be completed within the specified time frame.`;

  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = "Generating...";
  button.disabled = true;

  try {
    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.`,
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_completion_tokens: 500,
      }),
    });

    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;

    // Show the result section and display the routine
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("routineOutput").textContent = routine;
  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error("Error:", error);
    document.getElementById("routineOutput").textContent =
      "Sorry, there was an error generating your routine. Please try again.";
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML =
      '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});
