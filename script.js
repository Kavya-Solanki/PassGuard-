// Element references
const passwordInput = document.getElementById("passwordInput");
const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");
const entropyLabel = document.getElementById("entropyLabel");
const warningsDiv = document.getElementById("warnings");
const suggestionsDiv = document.getElementById("suggestions");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.getElementById("btnSubmit");
const submitMsg = document.getElementById("submitMsg");

lucide.createIcons();

// Toggle password visibility
togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.innerHTML = isHidden ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
  lucide.createIcons();
});

// Analyze password input
passwordInput.addEventListener("input", analyzePassword);

function analyzePassword() {
  const pw = passwordInput.value;
  const len = pw.length;
  const lower = /[a-z]/.test(pw);
  const upper = /[A-Z]/.test(pw);
  const num   = /[0-9]/.test(pw);
  const sym   = /[^A-Za-z0-9]/.test(pw);

  updateCriterion("critLower", lower);
  updateCriterion("critUpper", upper);
  updateCriterion("critNumber", num);
  updateCriterion("critSymbol", sym);

  const charset = (lower ? 26 : 0) + (upper ? 26 : 0) + (num ? 10 : 0) + (sym ? 32 : 0);
  const entropy = len * Math.log2(charset || 1);

  let score = 0;
  if (!pw) score = 0;
  else if (entropy < 28) score = 1;
  else if (entropy < 36) score = 2;
  else if (entropy < 60) score = 3;
  else if (entropy < 90) score = 4;
  else score = 5;

  const criteriaCount = [lower, upper, num, sym].filter(Boolean).length;
  if (criteriaCount < 4 && len < 12) score = Math.min(score, 3);
  if (len < 8) score = 1;

  const labelMap = ["Empty", "Very Weak", "Weak", "Fair", "Strong", "Excellent"];
  const colorMap = ["#ccc", "#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4"];

  strengthLabel.textContent = "Strength: " + (pw ? labelMap[score] : "—");
  entropyLabel.textContent = pw ? `Entropy: ${entropy.toFixed(1)} bits` : "Entropy: 0 bits";
  strengthBar.style.width = (score / 5) * 100 + "%";
  strengthBar.style.backgroundColor = colorMap[score];

  const warnings = [];
  const suggestions = [];
  const lowerPw = pw.toLowerCase();
  const commonWords = ["password", "welcome", "admin", "qwerty", "abc", "letmein"];

  for (const w of commonWords)
    if (lowerPw.includes(w)) warnings.push(`Contains common word "${w}"`);
  if (/(.)\1{2,}/.test(pw)) warnings.push("Repeated characters detected.");

  if (criteriaCount < 4) suggestions.push("Include upper, lower, numbers & symbols.");
  if (len < 12) suggestions.push("Use at least 12 characters for good security.");
  if (len >= 12 && criteriaCount === 4)
    suggestions.push("This is a strong, balanced password!");

  updateList(warningsDiv, warnings, "Warnings");
  updateList(suggestionsDiv, suggestions, "Suggestions");
}

function updateCriterion(id, ok) {
  const el = document.getElementById(id);
  if (ok) {
    el.classList.remove("bg-red-200","text-red-800");
    el.classList.add("bg-green-200","text-green-800");
  } else {
    el.classList.add("bg-red-200","text-red-800");
    el.classList.remove("bg-green-200","text-green-800");
  }
}

function updateList(div, list, title) {
  if (list.length === 0) { div.classList.add("hidden"); div.innerHTML=""; return; }
  div.classList.remove("hidden");
  div.innerHTML = `<strong>${title}</strong><ul class="list-disc list-inside">${list.map(
    i => `<li>${i}</li>`).join("")}</ul>`;
}

// Generator
const CHARS = {
  lower:"abcdefghijklmnopqrstuvwxyz",
  upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  num:"0123456789",
  sym:"!@#$%^&*()_+-=[]{}|;:,.<>/?`~",
};
const lenRange=document.getElementById("lengthRange");
const lenDisplay=document.getElementById("lenDisplay");
const chkLower=document.getElementById("chkLower");
const chkUpper=document.getElementById("chkUpper");
const chkNumbers=document.getElementById("chkNumbers");
const chkSymbols=document.getElementById("chkSymbols");
const btnGenerate=document.getElementById("btnGenerate");
const btnGenerateUse=document.getElementById("btnGenerateUse");
const genBox=document.getElementById("generatedBox");

lenRange.oninput=()=>lenDisplay.textContent=lenRange.value;

function secureRandomInt(max){
  const arr=new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0]%max;
}
function generatePassword(){
  let pool="";
  if(chkLower.checked) pool+=CHARS.lower;
  if(chkUpper.checked) pool+=CHARS.upper;
  if(chkNumbers.checked) pool+=CHARS.num;
  if(chkSymbols.checked) pool+=CHARS.sym;
  if(!pool) return "";
  let pw="";
  for(let i=0;i<lenRange.value;i++) pw+=pool.charAt(secureRandomInt(pool.length));
  return pw;
}

btnGenerate.addEventListener("click",()=>{
  const pw=generatePassword();
  genBox.textContent=pw;
  genBox.classList.remove("hidden");
});
btnGenerateUse.addEventListener("click",()=>{
  const pw=generatePassword();
  passwordInput.value=pw;
  analyzePassword();
  genBox.textContent=pw;
  genBox.classList.remove("hidden");
});

// ✅ Submit Button – works + refreshes page
submitBtn.addEventListener("click", ()=>{
  const pw = passwordInput.value.trim();
  if(!pw){
    submitMsg.textContent = "❌ Please enter a password first!";
    submitMsg.classList.remove("hidden","text-green-700");
    submitMsg.classList.add("text-red-600");
    return;
  }
  submitMsg.textContent = "✅ Password Submitted Successfully!";
  submitMsg.classList.remove("hidden","text-red-600");
  submitMsg.classList.add("text-green-700");
  setTimeout(()=>location.reload(),2000); // Refresh after 2s
});
