


let logindash = document.getElementById('logindash');
let Dashboard = document.getElementById('Dashboard');
let dashsignout = document.getElementById('dashsignout');
let validerr = document.getElementById('validerr');


dashsignout.addEventListener('click',()=>{
  deleteCookie("id");
  localStorage.removeItem('interndata')
  validerr.innerHTML = "";
  checkveridata();

})


checkveridata()

function checkveridata(){
  const x = getCookie("internuid");
  if(!x){
    Dashboard.setAttribute("style", "display: none !important;");
    logindash.style.display = "block";
  }else{
    const interndataobj = localStorage.getItem("interndata") || null;
    if(interndataobj!= null){
      logindash.style.display = "none";
      Dashboard.setAttribute("style", "display:flex !important;");
      const interndata = JSON.parse(interndataobj);
      if(interndata.version != "v1.9" || interndata.version == null){
        deleteCookie("internuid");
        checkveridata();
      }
      setdashdata(interndata)
      
    }else{
      deleteCookie("internuid");
      checkveridata();
    }
  }
  
}
  

function setdashdata(data){

  let internuid = document.getElementById('internuid');
  let internname = document.getElementById('internname');
  let internsdate = document.getElementById('internsdate');
  let internedate = document.getElementById('internedate');
  let interndom = document.getElementById('interndom')
  let domainpdf = document.getElementById('domainpdf');
  let certifstat = document.getElementById('certifstat');
  let deadline = document.getElementById('deadline');
  let progressbar = document.getElementById('progressbar');
  let compstat = document.getElementById('compstat');
  let duration = document.getElementById('duration');
 
  
  internuid.innerHTML = "ID: " +data.uniqueId || "NA";
  internname.innerHTML = data.studentName || "NA";
  internsdate.innerHTML =  data.startingDate|| "NA";
  internedate.innerHTML = data.awardDate || "NA";
  deadline.innerHTML = "Tasks Deadline: " + data.awardDate || "NA";
  interndom.innerHTML = data.domain || "NA";
  duration.innerHTML = "Duration : " + data.duration;
  
  let today = new Date();
  let endDate = parseDate(data.awardDate)
  let startingDate = parseDate(data.startingDate);
  let dataDuration = data.duration
  
  // let checkDate = parseDate("01/09/24");

let totalDuration = Math.floor((endDate - startingDate) / (1000 * 60 * 60 * 24));
let elapsedDuration = Math.floor((today - startingDate) / (1000 * 60 * 60 * 24));

// Clamp progress to max 100%
let progressPercentage = Math.floor(
  Math.max(0, Math.min((elapsedDuration / totalDuration) * 100, 100))
);


progressbar.style.width = progressPercentage + '%';
progressbar.innerHTML = progressPercentage + '%';

  if(data.status !=="Completed" && data.status !=="Terminated" && data.status !=="Submitted" && today <= endDate){
    
        certifstat.innerHTML = "Not Issued";
        compstat.innerHTML = "In Progress";
        
        if(dataDuration == "1 Month" || dataDuration == "2 Month"){
          document.getElementById("taskToDo").innerHTML="Note: Do any 2 Tasks (if 3 are shown)"
        }
        if(dataDuration == "3 Month"){
          document.getElementById("taskToDo").innerHTML="Note: Do any 3 Tasks (if 4 are shown)"
        }

        if(today >= startingDate){
            taskshow(data,domainpdf,startingDate,endDate,dataDuration);
            deadline.style.display="block";
        }else{
            document.getElementById('tasknt').style.display="block";
            document.getElementById('taskcontainer').style.display="none";
        }
    
    
  }else if(data.status == "Completed"){
    certifstat.innerHTML = "Certificate Given"
    compstat.innerHTML = "Completed"
    
    document.getElementById('taskcontainer').style.display="none";
    document.getElementById('awards').style.display="block";
    document.getElementById("taskToDo").style.display="none";

  }else if(data.status=="Terminated" || data.status !=="Completed" && today > endDate){

    certifstat.innerHTML = "Not Issued (Tasks Not Submitted)"
    compstat.innerHTML = "Terminated (Not Pursued)"
    progressbar.style.width="100%";
    progressbar.innerHTML="0%";
    document.getElementById('tasklink').style.display="block"
    document.getElementById('dateended').style.display="block";
    // document.getElementById('tasklinkbtn').style.display="block";
    document.getElementById('assignedtask').style.display = "none";
    document.getElementById('tasklink').innerHTML="Note: You can get certificate if you submit the project"
    taskshow(data,domainpdf,startingDate,endDate,dataDuration);
  
    }
    else if(data.status == "Initiated"){
        certifstat.innerHTML = "Not Issued";
        compstat.innerHTML = "Initiated (Start Soon)";
        document.getElementById("taskToDo").style.display="none";
        if(hasHalfTimePassed(startingDate, endDate)){
          document.getElementById('tasklink').innerHTML=`Note: Submit Your Task Before ${data.awardDate} To Recieve Certificate And For Completion Of Your Internship`
            document.getElementById('tasklink').style.display="block";
        }
    }
    else if(data.status=="Submitted"){
      certifstat.innerHTML = "Verification (In Progress)"
      compstat.innerHTML = "Task Submitted"
      document.getElementById('subNotif').style.display="block"
      document.getElementById('taskcontainer').style.display="none";
      document.getElementById("taskToDo").style.display="none";
    }
  
}


function taskshow(data,domainpdf,startingDate,endDate,duration){
      const start = new Date(startingDate);
      const targetDate = new Date("2025-06-15");
      let domainData = null;

      if((start >= targetDate && data.domain == "Web Development" )&& (duration == "2 Month" || duration == "3 Month")){

      const newData =  {
        "web development": [ 
          {
            "duration":"2 Month",
            "tasks": ["News platform", "TravelBuddy"],
            "link": "https://drive.google.com/file/d/1f78kDW3uCIZqsoVU7rGxf99xfMTM5DO_/view?usp=drive_link"
          },
          {
            "duration":"3 Month",
            "tasks": ["News platform", "TravelBuddy"],
            "link": "https://drive.google.com/file/d/1f78kDW3uCIZqsoVU7rGxf99xfMTM5DO_/view?usp=drive_link"
          }
        ]}
      domainData = newData["web development"].find(entry => entry.duration.toLowerCase() === duration.toLowerCase())
      }else{ 
        domainData = getTasksForDomain(data.domain, duration);
      }
  
        // const domainData = getTasksForDomain(data.domain,duration);
        const tasks = domainData.tasks;
        domainpdf.setAttribute('href',domainData.link)
        let taskbox = document.getElementById("taskbox");
        taskbox.innerHTML = "";
        var i = 1;
          tasks.forEach(e => {
            taskbox.innerHTML +=`
          <div class="col-md-4 col-xl-4">
                <div class="card bg-c-grey order-card">
                    <div class="card-block">
                        <h6 class="m-b-20">Task ${i}</h6>
                        <h3 class="m-b-0">${e}</h3>
                    </div>
                </div>
            </div>
          `;

          i++;
        });
        deadline.display="block"
        
  
        if (hasHalfTimePassed(startingDate, endDate)) {
          
            document.getElementById('tasklinkbtn').style.display="block";
          
            
        }
}

function parseDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }
  return date;
}

function hasHalfTimePassed(startDateStr, awardDateStr) {
  const startDate = parseDate(startDateStr);
  const awardDate = parseDate(awardDateStr);
  const today = new Date();

  // Calculate total days
  const totalDays = Math.floor((awardDate - startDate) / (1000 * 60 * 60 * 24));

  // Calculate halfway point
  const halfDays = Math.floor(totalDays / 2);

  // Get the halfway date
  const halfwayDate = new Date(startDate);
  halfwayDate.setDate(startDate.getDate() + halfDays);

  // Compare today with halfway date
  return today >= halfwayDate;

}



function getTasksForDomain(dom,duration) {  
  let tasklist = {
  "web development": [ 
    {
      "duration":"1 Month",
      "tasks": ["Blog Website", "Task Management"],
      "link": "https://drive.google.com/file/d/1cOIgakbhfe8FpjfcZguDWu46g_Pwn5QN/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["E-Commerce", "News Platform"],
      "link": "https://drive.google.com/file/d/1ArvreueL5eYfNfkNLRMmH-WPBINTWiYI/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Textbook Hub", "Skill Share","E-learning Platform"],
      "link": "https://drive.google.com/file/d/16AZkoP5c0jklKooqVU_L5n8QGROyeKli/view?usp=drive_link"
    }
  ]
  ,
  // "ui/ux": {
  //   "tasks": ["Textbook Hub", "Skill Share"],
  //   "link": "https://drive.google.com/file/d/1w_VTM0gSGwVG6Ogf0-dF1iFw8XEgHK2z/view?usp=sharing"
  // },

  "machine learning": [
    {
      "duration":"1 Month",
      "tasks": ["Sentiment Analysis", "Credit Card Fraud"],
      "link": "https://drive.google.com/file/d/1pckKyJVhqdoyo3NCJZ2m4wztAafqtVU-/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["Sentiment Analysis", "Credit Card Fraud"],
      "link": "https://drive.google.com/file/d/1pckKyJVhqdoyo3NCJZ2m4wztAafqtVU-/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Sentiment Analysis", "Credit Card Fraud","AI Interviewer"],
      "link": "https://drive.google.com/file/d/1stgvpkk1sGw-sMIv8aXF-YF-ARZySP51/view?usp=drive_link"
    }
  ],

  "c++ programming":[ 
      {
      "duration":"1 Month",
      "tasks": ["Inventory Management", "Simple Social", "Number Guessing"],
      "link": "https://drive.google.com/file/d/1VOi52ZyTnK2Muoh90kudrhSOH_6WGR-y/view?usp=drive_link"
      },
      {
      "duration":"2 Month",
      "tasks": ["Inventory Management", "Simple Social", "Number Guessing"],
      "link": "https://drive.google.com/file/d/1VOi52ZyTnK2Muoh90kudrhSOH_6WGR-y/view?usp=drive_link"
      },
      {
      "duration":"3 Month",
      "tasks": ["Inventory Management", "Simple Social", "Number Guessing"],
      "link": "https://drive.google.com/file/d/1FEAgufzt6oy2jbT0SI4FV_ugI3ZDB34x/view?usp=drive_link"
      }
  ],

  "python programming": [
    {
      "duration":"1 Month",
      "tasks": ["Contact Book", "Personal Finance", "EXPENSE TRACKER"],
      "link": "https://drive.google.com/file/d/1XIVQhuZvA5oLcXiyrL1WRsPbXsN1HSZ6/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["Contact Book", "Personal Finance", "EXPENSE TRACKER"],
      "link": "https://drive.google.com/file/d/1XIVQhuZvA5oLcXiyrL1WRsPbXsN1HSZ6/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Contact Book", "Personal Finance", "EXPENSE TRACKER"],
      "link": "https://drive.google.com/file/d/1vQWdN9q4oFn7xgg5phiyKurFfLUTer2v/view?usp=drive_link"
    }
  ],

  "java programming": [
    {
      "duration":"1 Month",
      "tasks": ["Simple Banking", "Library Management", "Simple Chat"],
      "link": "https://drive.google.com/file/d/14xCTHpQM7pob0tBzHSFLodTbCtwFEbyb/view?usp=drive_link"
    } ,
    {
      "duration":"2 Month",
      "tasks": ["Simple Banking", "Library Management", "Simple Chat"],
      "link": "https://drive.google.com/file/d/14xCTHpQM7pob0tBzHSFLodTbCtwFEbyb/view?usp=drive_link"
    } ,
    {
      "duration":"3 Month",
      "tasks": ["Simple Banking", "Library Management", "Simple Chat"],
      "link": "https://drive.google.com/file/d/16KHaf8nQSEV3ziNQj5_fR1UWDtm2PTLI/view?usp=drive_link"
    } 
  ],

  "artificial intelligence": [
    {
      "duration":"1 Month",
      "tasks": ["Chatbot NLP", "Image Captioning"],
      "link": "https://drive.google.com/file/d/1uIUkxWYqiSJc65FmoLn7NywNGi8YxKPK/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["Chatbot NLP", "Image Captioning"],
      "link": "https://drive.google.com/file/d/1uIUkxWYqiSJc65FmoLn7NywNGi8YxKPK/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Chatbot NLP", "Image Captioning" ,"AI Interviewer"],
      "link": "https://drive.google.com/file/d/1Vual29VHLTHWGZLRaaBBPnM7DBwef2fN/view?usp=drive_link"
    },
  ],

  "data science": [
    {
      "duration":"1 Month",
      "tasks": ["Webscrapping", "Text Detection"],
      "link": "https://drive.google.com/file/d/1Dyqv0fErGlADCM6JWh0m2Ny3EKOzWVZA/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["Webscrapping", "Text Detection"],
      "link": "https://drive.google.com/file/d/1Dyqv0fErGlADCM6JWh0m2Ny3EKOzWVZA/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Webscrapping", "Text Detection" ,"News Detection"],
      "link": "https://drive.google.com/file/d/13T3ECMJ0RpEFFTxH-2hHBFnS0Veg3L4a/view?usp=drive_link"
    },
  ],

  "android development": [
    {
      "duration":"1 Month",
      "tasks": ["Recipe Management", "News app"],
      "link": "https://drive.google.com/file/d/1Rmz__h5gmGtVwz05HGy8gKaCnaZlWMG1/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["Recipe Management", "News app"],
      "link": "https://drive.google.com/file/d/1Rmz__h5gmGtVwz05HGy8gKaCnaZlWMG1/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Recipe Management", "News app" , "Note-Taking App"],
      "link": "https://drive.google.com/file/d/19x_wAEZFJ4T_7ZgHnQ-phGAKeryeHTGq/view?usp=drive_link"
    }
  ],
  "cyber security":[
    {
      "duration":"1 Month",
      "tasks": ["Webscrapping", "Keylogger", "Phishing Page","WHOIS Domain"],
      "link": "https://drive.google.com/file/d/1hFzg2PwtBXRHxtdKJ4plqm7ymVntpoWk/view?usp=drive_link"
    },
    {
      "duration":"2 Month",
      "tasks": ["Webscrapping", "Keylogger", "Phishing Page","WHOIS Domain"],
      "link": "https://drive.google.com/file/d/1hFzg2PwtBXRHxtdKJ4plqm7ymVntpoWk/view?usp=drive_link"
    },
    {
      "duration":"3 Month",
      "tasks": ["Webscrapping", "Keylogger", "Phishing Page","WHOIS Domain"],
      "link": "https://drive.google.com/file/d/1hdkDlsHSPuiYIdzOl85zwCOEyc90mnx9/view?usp=drive_link"
    },
  ]

};
  dom = dom.toLowerCase();
  if (tasklist.hasOwnProperty(dom)) {
     return tasklist[dom].find(entry => entry.duration.toLowerCase() === duration.toLowerCase()) || null;
  } else {
    return [];
  }

}


document.getElementById('dashboardForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const verifidinput = document.getElementById('verifidinput').value;
  if(verifidinput.length >=10){
  
    const url = `https://script.google.com/macros/s/AKfycbwUZKiOUMiqD1_rku7A_MVsNnPexjEGR_qgnoEjxjnrw63oo_9iB2S03jBknugoC4NwWA/exec?id=${verifidinput}`;
    
    validerr.innerHTML = "Fetching...";
    fetch(url)
      .then(response => response.json())
      .then(data => {        
          setCookie("internuid",data.uniqueId,3);
          data.version = "v1.9";
          localStorage.setItem("interndata", JSON.stringify(data));
          checkveridata()
        
      })
      .catch(error => {
        validerr.innerHTML = "Not Found. If you have completed the internship recently, please wait for 24hrs";
      });
  }else{
    validerr.innerHTML = "Id Must Be Greater Than Or Equal to 10 Charachter";
  }
  
    
});


function getCookie(name){
    var pattern = RegExp(name + "=.[^;]*")
    var matched = document.cookie.match(pattern)
    if(matched){
        var cookie = matched[0].split('=')
        return cookie[1]
    }
    return false
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
    // console.log(name + "=" + (value || "") + expires + "; path=/");

}




