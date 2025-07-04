const applyloader = document.getElementById("applyloader");
const submiBTN = document.getElementById('submitBTN')
submiBTN.disabled="true"
handleSubmibtn(submiBTN)
document.getElementById("internForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const submitBtn = document.getElementById("submitBTN")

  formData.set("formType", "registration");
  // Convert full name to UPPERCASE and email to lowercase
  formData.set("fullName", formData.get("fullName").toUpperCase());

  formData.set("university", formData.get("university").toUpperCase());
  formData.set("email", formData.get("email").toLowerCase());

  const data = Object.fromEntries(formData.entries());

  // Validate form fields
  const validationErrors = validateForm(data);

  if (validationErrors.length > 0) {
    showModal("Form Validation Errors", validationErrors.join("<br>"));
    return;
  }
  
  submitBtn.disabled = true;
  showModal("Please wait...", "Submitting your application...");
  document.getElementById('internForm').style.display="none";
  applyloader.style.display="block"
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwUZKiOUMiqD1_rku7A_MVsNnPexjEGR_qgnoEjxjnrw63oo_9iB2S03jBknugoC4NwWA/exec", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.status === "success") {
      showModal("Internship Application", "Application Submitted Successfully!! Thankyou for applying at Cantilever. ");
      document.getElementById('confirmBox').style.display="block"
      this.reset();
    }else if(result.message=="Email already exists"){
       showModal("Application already submitted", "Email address already exists !");
      document.getElementById('internForm').style.display="block";
    } 
    else {
      showModal("Submission Error", "Something went wrong! Try again");
      document.getElementById('internForm').style.display="block";
    }
  } catch (error) {
    showModal("Network Error", "Submission failed! Try again after 30 minutes. ");
    document.getElementById('internForm').style.display="block";
  }
  submitBtn.disabled = false;
  applyloader.style.display="none"
});

function validateForm(data) {
  const errors = [];

  // Email validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  // Required fields
  const requiredFields = [
    "fullName", "email", "contactNumber", "gender", "internshipDomain", 
    "university", "qualification", "currentYear", "joinDate", "duration", 
    "source", "terms"
  ];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`The field "${field}" is required.`);
    }
  });

  // Full name must be uppercase and not contain numbers
  if (data.fullName && !/^[A-Z ]+$/.test(data.fullName)) {
    errors.push("Full name must be in UPPERCASE letters only and contain no numbers.");
  }

  // Contact number validation
  if (!/^\d{10,15}$/.test(data.contactNumber)) {
    errors.push("Contact number must be between 10 and 15 digits.");
  }

  // Terms checkbox
  if (data.terms !== "on") {
    errors.push("You must agree to the terms and conditions.");
  }

  return errors;
}

// Show modal with error messages
function showModal(title, message) {
  document.getElementById("erroModel").innerText = title;
  document.querySelector("#exampleModal .modal-body").innerHTML = message;

  // Bootstrap modal show
  const myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
  myModal.show();
}

const additionalInfoField = document.getElementById("additionalInfo");

additionalInfoField.addEventListener("input", () => {
  const words = additionalInfoField.value.trim().split(/\s+/);
  const wordCount = additionalInfoField.value.trim() === "" ? 0 : words.length;

  if (wordCount > 40) {
    additionalInfoField.value = words.slice(0, 40).join(" ");
    showModal("Word Limit Exceeded", "You can only enter up to 40 words in the additional info section.");
  }
});



function handleSubmibtn(submiBTN) {
  const requiredFields = [
    "fullName", "email", "contactNumber", "gender", "internshipDomain", 
    "university", "qualification", "currentYear", "joinDate", "duration", 
    "source", "terms"
  ];
  requiredFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    input.addEventListener("change", checkRequiredFields);
  });

  function checkRequiredFields() {
    const allFilled = requiredFields.every((id) => {
      const el = document.getElementById(id);
      return el && el.value.trim() !== "";
    });
    submiBTN.disabled = !allFilled;
  }
}
