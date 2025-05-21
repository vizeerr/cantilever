document.addEventListener("DOMContentLoaded", function () {
  const submissionCont = document.getElementById("submissionCont");
  const userData = JSON.parse(localStorage.getItem("interndata") || "{}");

  if (!userData || !userData.uniqueId) return;
  if(userData.status=="Submitted") return;

  if (hasHalfTimePassed(userData.startingDate, userData.awardDate)) {
    formhandler(userData);
    submissionCont.style.display = "block";
  } else {
    submissionCont.style.display = "none";
  }
});

function formhandler(userData) {
  const form = document.getElementById("submissionForm");
  const submiBTN = document.getElementById("submiBTN");
  const nextBTN = document.getElementById("nextBTN");
  const firstTab = document.getElementById('firstTab');
  const secondTab = document.getElementById('secondTab');
  const durationField = document.getElementById("durationField");
  const projThreeDiv = document.getElementById("projThree").closest(".mb-4");
  const loader = document.getElementById('loader')
  let tabs = 0;
  nextBTN.disabled = true;
  submiBTN.disabled = true;

  // Fill user data
  document.getElementById("id").value = userData.uniqueId || "";
  document.getElementById("fullName").value = userData.studentName?.toUpperCase() || "";
  document.getElementById("startDate").value = userData.startingDate || "";
  document.getElementById("awardDate").value = userData.awardDate || "";
  document.getElementById("internshipDomain").value = userData.domain || "";
  durationField.value = userData.duration || "";
  document.getElementById("email").value = userData.email?.toLowerCase() || "";

  // Show/hide Project 3 based on duration
  function handleProjThreeVisibility() {
    if (durationField.value === "3 Month") {
      projThreeDiv.style.display = "block";
    } else {
      projThreeDiv.style.display = "none";
    }
  }
  handleProjThreeVisibility();

  // Tabs
  tabhandler(tabs);

  nextBTN.addEventListener('click', () => {
    tabs++;
    tabhandler(tabs);
    handleSubmibtn(submiBTN);
  });

  handleNextbtn(nextBTN, durationField);
  validateFileInput("linkedSS");
  validateFileInput("paymentSS");

  // Submit
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    formData.set("formType", "submission");
    
    const fullName = formData.get("fullName");
    if (fullName) formData.set("fullName", fullName.toUpperCase());

    const email = formData.get("email");
    if (email) formData.set("email", email.toLowerCase());


    const data = Object.fromEntries(formData.entries());
    const validationErrors = validateForm(data, durationField.value);

    if (validationErrors.length > 0) {
      showModal("Form Validation Errors", validationErrors.join("<br>"));
      return;
    }

    submiBTN.disabled = true;
    showModal("Please wait...", "Do not reload website submitting your application...");
    loader.style.display="block"
    secondTab.style.display="none"
    try {
    const linkedBase64 = await convertFileToBase64(formData.get("linkedSS"));
    const paymentBase64 = await convertFileToBase64(formData.get("paymentSS"));

    formData.set("linkedBase", linkedBase64);
    formData.set("paymentBase", paymentBase64);
    const finalData = Object.fromEntries(formData.entries());

      const response = await fetch("https://script.google.com/macros/s/AKfycbwUZKiOUMiqD1_rku7A_MVsNnPexjEGR_qgnoEjxjnrw63oo_9iB2S03jBknugoC4NwWA/exec", {
        method: "POST",
        body: JSON.stringify(finalData),
      });

      const result = await response.json();
      if (result.status === "success") {
        showModal("Success", "Task Submitted Successfully! Thank you to be a part of cantilever.");
        form.reset();
        let interdata = JSON.parse(localStorage.getItem('interndata')) || {};
        interdata.status = "Submitted";
        localStorage.setItem('interndata', JSON.stringify(interdata));
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
       
      } else {
        showModal("Submission Error", "Something went wrong!  Please try again later");
        firstTab.style.display="block"

      }
    } catch (error) {
      showModal("Network Error", "Submission failed. Please try again later.");
      firstTab.style.display="block"
    }

    submiBTN.disabled = false;
    loader.style.display="none"
    
  });
}

function handleNextbtn(nextBTN, durationField) {
  const requiredFields = ["fullName", "email", "startDate", "awardDate", "internshipDomain", "durationField", "projOne", "projTwo", "projThree"];
  requiredFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    input.addEventListener("input", checkRequiredFields);
  });

  function checkRequiredFields() {
    const isThreeMonth = durationField.value === "3 Month";
    const allFilled = requiredFields.every((id) => {
      if (!isThreeMonth && id === "projThree") return true;
      const el = document.getElementById(id);
      return el && el.value.trim() !== "";
    });
    nextBTN.disabled = !allFilled;
  }
}

function handleSubmibtn(submiBTN) {
  const requiredFields = ["linkedSS", "paymentSS"];
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

function validateFileInput(id) {
  const input = document.getElementById(id);
  input.addEventListener("change", function () {
    const file = input.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 2 * 1024 * 1024;

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        showModal("Invalid File", "Only JPG, JPEG, and PNG formats are allowed.");
        input.value = "";
      } else if (file.size > maxSize) {
        showModal("File Too Large", "File size must be less than 2MB.");
        input.value = "";
      }
    }
  });
}

function tabhandler(tabs) {
  const firstTab = document.getElementById('firstTab');
  const secondTab = document.getElementById('secondTab');

  firstTab.style.display = tabs === 0 ? "block" : "none";
  secondTab.style.display = tabs === 1 ? "block" : "none";
}

function validateForm(data, duration) {
  const errors = [];
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9.-]+\.[a-z]{2,}.*$/;

  if (!emailRegex.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  const required = ["projOne", "projTwo", "linkedSS", "paymentSS", "terms"];
  if (duration === "3 Month") required.push("projThree");

  required.forEach((field) => {
    if (!data[field]) {
      errors.push(`The field "${field}" is required.`);
    }
  });

  ["projOne", "projTwo", "projThree"].forEach((field) => {
    if (duration === "3 Month" || field !== "projThree") {
      const url = data[field];
      if (url && (!urlRegex.test(url) || !url.includes("github.com"))) {
        if(field == "projOne"){
            errors.push(`Project one link must be a valid external GitHub link starting with http:// or https://.`);
        }
        if(field == "projTwo"){
            errors.push(`Project one link must be a valid external GitHub link starting with http:// or https://.`);
        }
        if(field == "projThree"){
            errors.push(`Project one link must be a valid external GitHub link starting with http:// or https://.`);
        }
      }
    }
  });

  if (data.terms !== "on") {
    errors.push("You must agree to the terms and conditions.");
  }

  return errors;
}


function showModal(title, message) {
  document.getElementById("erroModel").innerText = title;
  document.querySelector("#exampleModal .modal-body").innerHTML = message;
  new bootstrap.Modal(document.getElementById("exampleModal")).show();
}

function hasHalfTimePassed(startDateStr, awardDateStr) {
  const startDate = parseDate(startDateStr);
  const awardDate = parseDate(awardDateStr);
  const today = new Date();
  const totalDays = Math.floor((awardDate - startDate) / (1000 * 60 * 60 * 24));
  const halfDays = Math.floor(totalDays / 2);
  const halfwayDate = new Date(startDate);
  halfwayDate.setDate(startDate.getDate() + halfDays);
  return today >= halfwayDate;
}

function parseDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) throw new Error("Invalid date format. Use YYYY-MM-DD");
  return date;
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsDataURL(file);
  });
}
