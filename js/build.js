function buildJobsite(job, idx) {
  const jobsiteDiv = document.createElement("div");
  jobsiteDiv.classList.add("jobsite");
  jobsiteDiv.id = `${idx}`;
  const buyDiv = document.createElement("div");
  buyDiv.classList.add("jobsite-buy");
  const jobsiteNameSpan = document.createElement("span");
  jobsiteNameSpan.classList.add("jobsite-name");
  jobsiteNameSpan.id = `jobsite-name-${idx}`;
  jobsiteNameSpan.textContent = job.name;
  const jobsiteBtn = document.createElement("button");
  jobsiteBtn.classList.add("jobsite-btn");
  jobsiteBtn.id = `jbtn-${idx}`;
  const btnText = document.createTextNode("Buy 1 ");
  const brElement = document.createElement("br");
  const jobsiteCostSpan = document.createElement("span");
  jobsiteCostSpan.classList.add("jobsite-cost");
  jobsiteCostSpan.id = `jobsite-cost-${idx}`;
  jobsiteCostSpan.textContent = `Price: ${job.cost}`;
  jobsiteBtn.appendChild(btnText);
  jobsiteBtn.appendChild(brElement);
  jobsiteBtn.appendChild(jobsiteCostSpan);
  jobsiteBtn.addEventListener("click", () => handleBuy(idx));
  buyDiv.appendChild(jobsiteNameSpan);
  buyDiv.appendChild(jobsiteBtn);
  const jobsDiv = document.createElement("div");
  jobsDiv.classList.add("jobsite-jobs");
  jobsDiv.id = `jobsite-jobs-${idx}`;
  const removeDiv = document.createElement("div");
  removeDiv.classList.add("jobsite-remove");
  removeDiv.id = `jobsite-remove-${idx}`;
  removeDiv.textContent = "❌";
  removeDiv.addEventListener("click", () => handleRemove(idx));
  jobsiteDiv.appendChild(buyDiv);
  jobsiteDiv.appendChild(jobsDiv);
  jobsiteDiv.appendChild(removeDiv);
  return jobsiteDiv;
}

function buildThinking(s) {
  const thinkDiv = document.createElement("div");
  thinkDiv.classList.add("thinking");
  thinkDiv.id = `thinking-${s._id}`;
  const thinkImg = document.createElement("img");
  thinkImg.src = "img/think.png";
  thinkImg.classList.add("think-img");
  thinkDiv.appendChild(thinkImg);
  return thinkDiv;
}
