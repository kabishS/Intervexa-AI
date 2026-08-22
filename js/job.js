
/* =========================================================
   API endpoints (all free, no key required)
   ========================================================= */
const JOBICY_API     = "https://jobicy.com/api/v2/remote-jobs";
const ARBEITNOW_API  = "https://arbeitnow.com/api/job-board-api";
const AIDEVBOARD_API = "https://aidevboard.com/api/v1/jobs";
const REMOTIVE_API   = "https://remotive.com/api/remote-jobs";

const locationLabels = { "": "Worldwide", india: "India", usa: "USA", uk: "UK" };
const titleLabels = { developer: "Developer", frontend: "Frontend Developer", backend: "Backend Developer", java: "Java Developer", python: "Python Developer" };

const SOURCE_META = {
    jobicy:      { name: "Jobicy",      color: "#2563EB" },
    arbeitnow:   { name: "Arbeitnow",   color: "#16A34A" },
    aidevboard:  { name: "AI Dev Board", color: "#9333EA" },
    remotive:    { name: "Remotive",    color: "#D97706" }
};

let activeSources = new Set(Object.keys(SOURCE_META));

/* =========================================================
   Source toggle chips
   ========================================================= */
document.querySelectorAll(".source-chip").forEach(chip => {
    chip.addEventListener("click", () => {
        const src = chip.dataset.source;
        if (activeSources.has(src)) {
            if (activeSources.size === 1) return; // keep at least one source active
            activeSources.delete(src);
            chip.classList.remove("active");
        } else {
            activeSources.add(src);
            chip.classList.add("active");
        }
    });
});

/* =========================================================
   Helpers
   ========================================================= */
function initials(name){
    if(!name) return "JB";
    return name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
}

function matchesType(typeStr, wantedType){
    if(!wantedType) return true;
    if(!typeStr) return false;
    const t = typeStr.toLowerCase();
    if(wantedType === "fulltime") return t.includes("full");
    if(wantedType === "parttime") return t.includes("part");
    if(wantedType === "intern") return t.includes("intern") || t.includes("student");
    return true;
}

function matchesLocation(locStr, wantedLoc){
    if(!wantedLoc) return true;
    if(!locStr) return false;
    const l = locStr.toLowerCase();
    if(wantedLoc === "india") return l.includes("india");
    if(wantedLoc === "usa") return l.includes("usa") || l.includes("united states") || l.includes("us ") || l.endsWith(" us");
    if(wantedLoc === "uk") return l.includes("uk") || l.includes("united kingdom") || l.includes("britain");
    return true;
}

function salaryLabel(min, max){
    if(!min && !max) return null;
    const fmt = n => n >= 1000 ? `$${Math.round(n/1000)}k` : `$${n}`;
    if(min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max);
}

/* =========================================================
   Fetchers — each normalizes into a common job shape:
   { title, company, location, type, tags, url, excerpt, source, salary }
   ========================================================= */

async function fetchJobicy(titleKey, locKey){
    const url = `${JOBICY_API}?count=20&tag=${encodeURIComponent(titleKey)}&geo=${encodeURIComponent(locKey)}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.jobs || []).map(job => ({
        title: job.jobTitle,
        company: job.companyName || "Company",
        location: job.jobGeo || "Remote",
        type: job.jobType || "",
        tags: [],
        url: job.url,
        excerpt: job.jobExcerpt || "No description provided for this role.",
        source: "jobicy",
        salary: null
    }));
}

async function fetchArbeitnow(){
    const res = await fetch(ARBEITNOW_API);
    const data = await res.json();
    return (data.data || []).map(job => ({
        title: job.title,
        company: job.company_name || "Company",
        location: job.location || (job.remote ? "Remote" : ""),
        type: (job.job_types && job.job_types.join(", ")) || (job.remote ? "Remote" : ""),
        tags: job.tags || [],
        url: job.url,
        excerpt: (job.description || "No description provided for this role.").replace(/<[^>]*>/g, "").slice(0, 220),
        source: "arbeitnow",
        salary: null
    }));
}

async function fetchAiDevBoard(titleKey, locKey){
    const params = new URLSearchParams({ q: titleLabels[titleKey] || titleKey, limit: "20" });
    if(locKey && locationLabels[locKey] && locKey !== "") params.set("location", locationLabels[locKey]);
    const res = await fetch(`${AIDEVBOARD_API}?${params.toString()}`);
    const data = await res.json();
    return (data.jobs || []).map(job => ({
        title: job.title,
        company: job.company_name || "Company",
        location: job.location || job.workplace || "Remote",
        type: job.job_type || job.experience_level || "",
        tags: job.tags || [],
        url: job.apply_url,
        excerpt: (job.description || job.requirements || "No description provided for this role.").replace(/<[^>]*>/g, "").slice(0, 220),
        source: "aidevboard",
        salary: salaryLabel(job.salary_min, job.salary_max)
    }));
}

async function fetchRemotive(titleKey){
    const params = new URLSearchParams({ search: titleLabels[titleKey] || titleKey, category: "software-dev", limit: "20" });
    const res = await fetch(`${REMOTIVE_API}?${params.toString()}`);
    const data = await res.json();
    return (data.jobs || []).map(job => ({
        title: job.title,
        company: job.company_name || "Company",
        location: job.candidate_required_location || "Worldwide",
        type: job.job_type || "",
        tags: job.category ? [job.category] : [],
        url: job.url,
        excerpt: (job.description || "No description provided for this role.").replace(/<[^>]*>/g, "").slice(0, 220),
        source: "remotive",
        salary: job.salary || null
    }));
}

/* =========================================================
   Main search
   ========================================================= */
async function getJobs(){

    const title = document.getElementById("jobTitle").value;
    const location = document.getElementById("location").value;
    const type = document.getElementById("jobType").value;

    document.getElementById("jobs").innerHTML =
        `<div class="loading-grid">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>`;
    document.getElementById("resultsBar").style.display = "none";
    document.getElementById("sourceWarning").classList.remove("show");

    const fetchers = [];
    if(activeSources.has("jobicy"))     fetchers.push(["jobicy", fetchJobicy(title, location)]);
    if(activeSources.has("arbeitnow"))  fetchers.push(["arbeitnow", fetchArbeitnow()]);
    if(activeSources.has("aidevboard")) fetchers.push(["aidevboard", fetchAiDevBoard(title, location)]);
    if(activeSources.has("remotive"))   fetchers.push(["remotive", fetchRemotive(title)]);

    const settled = await Promise.allSettled(fetchers.map(f => f[1]));

    let allJobs = [];
    const failedSources = [];

    settled.forEach((result, i) => {
        const sourceKey = fetchers[i][0];
        if(result.status === "fulfilled"){
            allJobs = allJobs.concat(result.value);
        }else{
            failedSources.push(SOURCE_META[sourceKey].name);
            console.warn(`${sourceKey} failed:`, result.reason);
        }
    });

    // Client-side filtering for sources that don't support all params server-side
    allJobs = allJobs.filter(job => {
        const titleMatch = title === "developer"
            ? true
            : (job.title || "").toLowerCase().includes(titleLabels[title].split(" ")[0].toLowerCase())
              || (job.tags || []).some(t => t.toLowerCase().includes(titleLabels[title].split(" ")[0].toLowerCase()));
        const locMatch = job.source === "jobicy" ? true : matchesLocation(job.location, location); // jobicy already filtered server-side
        const typeMatch = matchesType(job.type, type);
        return titleMatch && locMatch && typeMatch;
    });

    if(failedSources.length){
        const warn = document.getElementById("sourceWarning");
        warn.textContent = `Couldn't load results from: ${failedSources.join(", ")}. Showing jobs from the remaining sources.`;
        warn.classList.add("show");
    }

    displayJobs(allJobs, title, location);
}

/* =========================================================
   Render
   ========================================================= */
function displayJobs(jobs, title, location){

    const container = document.getElementById("jobs");
    const bar = document.getElementById("resultsBar");
    const count = document.getElementById("resultCount");
    const query = document.getElementById("resultQuery");

    container.innerHTML = "";

    if(jobs.length === 0){
        bar.style.display = "none";
        container.innerHTML =
            `<div class="empty-state">
                <div class="icon">🔍</div>
                <h2>No jobs found</h2>
                <p>Try a different title, location, job type, or enable more sources above.</p>
            </div>`;
        return;
    }

    bar.style.display = "flex";
    count.innerHTML = `<b>${jobs.length}</b> job${jobs.length===1?"":"s"} found`;
    query.textContent = `${titleLabels[title] || title} · ${locationLabels[location] || "Worldwide"}`;

    jobs.forEach((job, i) => {
        const meta = SOURCE_META[job.source] || { name: job.source, color: "#6B7280" };

        container.innerHTML += `
        <div class="job-card" style="animation-delay:${Math.min(i*0.04,0.4)}s">

            <div class="card-top">
                <div class="avatar">${initials(job.company)}</div>
                <div class="pill-group">
                    <span class="source-pill" style="background:${meta.color}">${meta.name}</span>
                    <div class="type-pill">${job.type || "Remote"}</div>
                </div>
            </div>

            <h2>${job.title}</h2>
            <h3>${job.company}</h3>

            <div class="meta-row">
                <div class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${job.location || "Remote"}
                </div>
                ${job.salary ? `
                <div class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    ${job.salary}
                </div>` : ""}
            </div>

            <p class="excerpt">${job.excerpt}</p>

            <a href="${job.url}" target="_blank" rel="noopener">
                Apply Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>

        </div>`;
    });
}

getJobs();
