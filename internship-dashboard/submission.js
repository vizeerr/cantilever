document.addEventListener("DOMContentLoaded", function () {
  const submissionCont = document.getElementById("submissionCont");
  const userData = JSON.parse(localStorage.getItem("interndata") || "{}");

  if (!userData || !userData.uniqueId || userData.status === "Submitted") return;

  if (hasHalfTimePassed(userData.startingDate, userData.awardDate)) {
    formhandler(userData);
    submissionCont.style.display = "block";
  } else {
    submissionCont.style.display = "none";
  }

  document.getElementById("tasklinkbtn").addEventListener("click", () => {
    formhandler(userData);
    submissionCont.style.display = "block";
  });
});

function formhandler(userData) {
  const form = document.getElementById("submissionForm");
  const submiBTN = document.getElementById("submiBTN");
  const nextBTN = document.getElementById("nextBTN");
  const durationField = document.getElementById("durationField");
  const projThreeDiv = document.getElementById("projThree").closest(".mb-4");
  const loader = document.getElementById("loader");

  let tabs = 0;

  const qrCode = document.getElementById('qrCode')
  console.log(userData.duration);
  
  if(userData.duration == "1 Month"){
    qrCode.src="../assets/images/oneqr.png"
  }
  
  if(userData.duration == "2 Month"){
    qrCode.src="../assets/images/twoqr.png"
  }
  
  if(userData.duration == "3 Month"){
    qrCode.src="../assets/images/threeqr.png"
  }

  // Fill data
  document.getElementById("id").value = userData.uniqueId || "";
  document.getElementById("fullName").value = userData.studentName?.toUpperCase() || "";
  document.getElementById("startDate").value = userData.startingDate || "";
  document.getElementById("awardDate").value = userData.awardDate || "";
  document.getElementById("internshipDomain").value = userData.domain || "";
  durationField.value = userData.duration || "";
  document.getElementById("email").value = userData.email?.toLowerCase() || "";

  // Show/hide Project 3
  projThreeDiv.style.display = durationField.value === "3 Month" ? "block" : "none";
  durationField.addEventListener("change", () => {
    projThreeDiv.style.display = durationField.value === "3 Month" ? "block" : "none";
  });

  // Tab logic
  tabhandler(tabs);
  handleTabValidation(tabs);

  nextBTN.addEventListener("click", () => {
    const data = collectTabData(tabs);
    const duration = durationField.value;
    const errors = validateTabData(data, tabs, duration);

    if (errors.length === 0) {
      tabs++;
      tabhandler(tabs);
      handleTabValidation(tabs);
    } else {
      showModal("Validation Error", errors.join("<br>"));
    }
  });
  
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    submiBTN.disabled = true;
    loader.style.display = "block";
    showModal("Please wait...", "Submitting your application...");

    const formData = new FormData(form);
    formData.set("formType", "submission");
    formData.set("fullName", formData.get("fullName").toUpperCase());
    formData.set("email", formData.get("email").toLowerCase());
    formData.set("upiID", formData.get("upiID").toLowerCase());


    const data = Object.fromEntries(formData.entries());
    const duration = durationField.value;
    const errors = validateForm(data, duration);

    if (errors.length > 0) {
      showModal("Form Validation Errors", errors.join("<br>"));
      submiBTN.disabled = false;
      loader.style.display = "none";
      return;
    }

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
      // console.log(result);
      
      if (result.status === "success") {
        showModal("Success", "Submitted successfully!");
        form.reset();
        localStorage.setItem("interndata", JSON.stringify({ ...userData, status: "Submitted" }));
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error("Submission failed");
      }

    } catch (error) {
      // console.log(error);
      
      showModal("Submission Error", "Something went wrong. Please try again later.");
    }

    submiBTN.disabled = false;
    loader.style.display = "none";
  });
}

function tabhandler(tabs) {
  const tabsArr = ["firstTab", "secondTab", "thirdTab"];
  tabsArr.forEach((id, i) => {
    document.getElementById(id).style.display = i === tabs ? "block" : "none";
  });

  if (tabs === 2) {
    document.getElementById("nextBTN").style.display = "none";
    handleSubmitButtonState();
  } else {
    document.getElementById("nextBTN").style.display = "inline-block";
  }
}

function handleTabValidation(tabIndex) {
  const durationField = document.getElementById("durationField");
  const duration = durationField.value;

  const fieldsByTab = {
    0: ["fullName", "email", "startDate", "awardDate", "internshipDomain", "durationField", "projOne", "projTwo", "projThree"],
    1: ["linkedSS"],
  };

  const checkFields = () => {
    const required = fieldsByTab[tabIndex] || [];
    const allFilled = required.every(id => {
      if (id === "projThree" && duration !== "3 Month") return true;
      const el = document.getElementById(id);
      return el && el.value.trim() !== "";
    });

    document.getElementById("nextBTN").disabled = !allFilled;
  };

  (fieldsByTab[tabIndex] || []).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", checkFields);
    if (el && el.type === "file") el.addEventListener("change", checkFields);
  });

  durationField.addEventListener("change", checkFields);
  checkFields();
}

function handleSubmitButtonState() {
  const submiBTN = document.getElementById("submiBTN");
  const requiredFields = ["upiID", "paymentSS"];
  ["paymentSS"].forEach(validateFileInput);

  const checkFields = () => {
    const allFilled = requiredFields.every(id => {
      const el = document.getElementById(id);
      return el && el.value.trim() !== "";
    });
    submiBTN.disabled = !allFilled;
  };

  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", checkFields);
  });

  checkFields();
}

function validateTabData(data, tabIndex, duration) {
  const errors = [];
  const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9.-]+\.[a-z]{2,}.*$/;

  if (tabIndex === 0) {
    if (!data.fullName || !data.email || !data.startDate || !data.awardDate) {
      errors.push("Please complete all fields.");
    }

    ["projOne", "projTwo"].forEach(field => {
      if (!data[field] || !urlRegex.test(data[field]) || !data[field].includes("github.com")) {
        errors.push(`${field} must be a valid GitHub URL.`);
      }
    });

    if (duration === "3 Month" && (!data.projThree || !urlRegex.test(data.projThree) || !data.projThree.includes("github.com"))) {
      errors.push("projThree must be a valid GitHub URL.");
    }
  }

  if (tabIndex === 1) {
    ["linkedSS"].forEach(validateFileInput);
    if (!data.linkedSS) {
      errors.push("LinkedIn screenshots are required.");
    }
  }

  return errors;
}

function collectTabData(tabIndex) {
  const fieldsByTab = {
    0: ["fullName", "email", "startDate", "awardDate", "internshipDomain", "durationField", "projOne", "projTwo", "projThree"],
    1: ["linkedSS"],
  };
  const fields = fieldsByTab[tabIndex] || [];
  const data = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value || (el.files && el.files[0]) || "";
  });
  return data;
}

function validateForm(data, duration) {
  const errors = [];
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

  if (!emailRegex.test(data.email)) errors.push("Invalid email.");
  if (!upiRegex.test(data.upiID || '')) errors.push("Invalid UPI ID.");

  const required = ["projOne", "projTwo", "linkedSS", "paymentSS"];
  if (duration === "3 Month") required.push("projThree");

  required.forEach(field => {
    if (!data[field]) errors.push(`${field} is required.`);
  });

  if (data.terms !== "on") errors.push("You must agree to the terms and conditions.");

  return errors;
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

function showModal(title, message) {
  document.getElementById("erroModel").innerText = title;
  document.querySelector("#exampleModal .modal-body").innerHTML = message;
  new bootstrap.Modal(document.getElementById("exampleModal")).show();
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject("File read failed");
    reader.readAsDataURL(file);
  });
}

function hasHalfTimePassed(startDateStr, awardDateStr) {
  const startDate = new Date(startDateStr);
  const awardDate = new Date(awardDateStr);
  const today = new Date();
  const total = (awardDate - startDate) / (1000 * 60 * 60 * 24);
  return today >= new Date(startDate.setDate(startDate.getDate() + total / 2));
}
