// const applyloader = document.getElementById("applyloader");
const submiBTN = document.getElementById('submitBTN')
submiBTN.disabled="true"
handleSubmibtn(submiBTN)

document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const submitBtn = document.getElementById("submitBTN")

  formData.set("formType", "contactus");

  formData.set("fullName", formData.get("fullName").toUpperCase());
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


  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwUZKiOUMiqD1_rku7A_MVsNnPexjEGR_qgnoEjxjnrw63oo_9iB2S03jBknugoC4NwWA/exec", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (result.status === "success") {
      showModal("Contact", "Thankyou for reaching out to us. We will get back to you shortly.");
      this.reset();
    } else {
      showModal("Submission Error", "Something went wrong! Try again");

    }
  } catch (error) {
    showModal("Network Error", "Submission failed! Try again after 30 minutes. ");
  }
  submitBtn.disabled = false;
  // applyloader.style.display="none"
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
    "fullName", "email", "subject","message","category"
  ];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`The field "${field}" is required.`);
    }
  });

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

const additionalInfoField = document.getElementById("message");

additionalInfoField.addEventListener("input", () => {
  const words = additionalInfoField.value.trim().split(/\s+/);
  const wordCount = additionalInfoField.value.trim() === "" ? 0 : words.length;

  if (wordCount > 100) {
    additionalInfoField.value = words.slice(0, 100).join(" ");
    showModal("Word Limit Exceeded", "You can only enter up to 100 words messsage.");
  }
});



function handleSubmibtn(submiBTN) {
  const requiredFields = [
    "fullName", "email", "subject","category","message"
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
