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

function buildThinking(think) {
  const thinkingDiv = document.createElement("div");
  thinkingDiv.id = think._id;
  thinkingDiv.classList.add("thinking", "disabled");

  const iconDiv = document.createElement("div");
  iconDiv.classList.add("icon-sm", "thinking-icon");
  if (think.type === "unlocker") {
    iconDiv.innerText = "🔓";
  } else {
    iconDiv.innerText = "💭";
  }
  thinkingDiv.appendChild(iconDiv);

  const nameHeader = document.createElement("h3");
  nameHeader.classList.add("thinking-name");
  nameHeader.innerText = think.name;
  thinkingDiv.appendChild(nameHeader);

  const effectParagraph = document.createElement("p");
  effectParagraph.classList.add("thinking-effect");
  effectParagraph.innerText = think.effect;
  thinkingDiv.appendChild(effectParagraph);

  const costDiv = document.createElement("div");
  costDiv.classList.add("thinking-cost");
  thinkingDiv.appendChild(costDiv);

  const costSpan = document.createElement("span");
  costSpan.classList.add("cost");
  costSpan.id = `${think._id}-cost`;
  costSpan.innerText = think.cost;
  costDiv.appendChild(costSpan);

  const lightbulbSpan = document.createElement("span");
  lightbulbSpan.classList.add("icon-sm");
  lightbulbSpan.innerText = "💡";
  costDiv.appendChild(lightbulbSpan);
  thinkingDiv.addEventListener("click", () => handleBuyThinking(think));
  return thinkingDiv
}
