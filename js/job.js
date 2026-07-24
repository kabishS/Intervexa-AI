const API =
"https://jobicy.com/api/v2/remote-jobs";


const locationLabels = { "": "Worldwide", india:"India", usa:"USA", uk:"UK" };
const titleLabels = { developer:"Developer", frontend:"Frontend Developer", backend:"Backend Developer", java:"Java Developer", python:"Python Developer" };


async function getJobs(){


let title =
document.getElementById("jobTitle").value;


let location =
document.getElementById("location").value;


let type =
document.getElementById("jobType").value;


document.getElementById("jobs").innerHTML =
`<div class="loading-grid">
<div class="skeleton-card"></div>
<div class="skeleton-card"></div>
<div class="skeleton-card"></div>
</div>`;
document.getElementById("resultsBar").style.display = "none";


let url =
`${API}?count=20&tag=${title}&geo=${location}`;


try{

let response =
await fetch(url);


let data =
await response.json();



let jobs =
data.jobs || [];



// Internship filter
if(type){

jobs = jobs.filter(job =>

job.jobType &&
job.jobType.toLowerCase()
.includes(type)

);

}



displayJobs(jobs, title, location);

}catch(err){

document.getElementById("jobs").innerHTML =
`<div class="empty-state">
<div class="icon">⚠️</div>
<h2>Couldn't load jobs</h2>
<p>Something went wrong reaching the jobs API. Please try again.</p>
</div>`;

}



}


function initials(name){
if(!name) return "JB";
return name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
}


function displayJobs(jobs, title, location){


let container =
document.getElementById("jobs");

let bar = document.getElementById("resultsBar");
let count = document.getElementById("resultCount");
let query = document.getElementById("resultQuery");


container.innerHTML="";



if(jobs.length===0){

bar.style.display = "none";

container.innerHTML =
`<div class="empty-state">
<div class="icon">🔍</div>
<h2>No jobs found</h2>
<p>Try a different title, location, or job type.</p>
</div>`;

return;

}


bar.style.display = "flex";
count.innerHTML = `<b>${jobs.length}</b> job${jobs.length===1?"":"s"} found`;
query.textContent = `${titleLabels[title] || title} · ${locationLabels[location] || "Worldwide"}`;



jobs.forEach((job, i)=>{


container.innerHTML += `

<div class="job-card" style="animation-delay:${Math.min(i*0.05,0.4)}s">

<div class="card-top">
<div class="avatar">${initials(job.companyName)}</div>
<div class="type-pill">${job.jobType || "Remote"}</div>
</div>


<h2>
${job.jobTitle}
</h2>


<h3>
${job.companyName || "Company"}
</h3>

<div class="meta-row">
<div class="meta-item">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
${job.jobGeo || "Remote"}
</div>
</div>


<p class="excerpt">
${job.jobExcerpt || "No description provided for this role."}
</p>


<a href="${job.url}" target="_blank" rel="noopener">
Apply Now
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
</a>


</div>

`;


});


}



getJobs();

