document.getElementById("internForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Validate form fields
  const validationErrors = validateForm(data);

  if (validationErrors.length > 0) {
    // Display validation errors
    alert(validationErrors.join("\n"));
    return;
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzV-JsiMrKjV90PrRg65Ad7-HqYazN5QUlkDhbDaiETow94o9ggtq4UqYpuVnd4yZxt/exec", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("Submitted successfully!");
      this.reset();
    } else {
      console.log(result.message || "Something went wrong!");
    }
  } catch (error) {
    console.log("Submission failed: " + error.message);
  }
});

function validateForm(data) {
  const errors = [];

  // Validate email format using a more detailed regex for a valid email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  // Check if required fields are filled
  const requiredFields = ["fullName", "email", "contactNumber", "gender", "internshipDomain", "university", "qualification", "currentYear", "joinDate", "source", "terms"];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`The field ${field} is required.`);
    }
  });

  // Validate full name (no numbers allowed)
  if (data.fullName && /\d/.test(data.fullName)) {
    errors.push("Full name cannot contain numbers.");
  }

  // Validate contact number (example: must be numeric and at least 10 digits)
  if (data.contactNumber && !/^\d{10,15}$/.test(data.contactNumber)) {
    errors.push("Contact number must be between 10 and 15 digits.");
  }


  // Ensure the "Terms" checkbox is checked
  if (data.terms !== "on") {
    errors.push("You must agree to the terms and conditions.");
  }

  return errors;
}
