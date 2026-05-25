const theme = document.getElementById("theme-select");
const form = document.getElementById("myForm");
const title = document.getElementById("title");
const catSelect = document.getElementById("cat-select");
const description = document.getElementById("desc");

let suggesstions = [];

const addSuggest = (suggest) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (suggest) {
        suggesstions.push(suggest);
        resolve(suggesstions);
      } else {
        reject(suggesstions);
      }
    }, 2000);
  });
};

const saveSuggest = (suggest) => {
  return new Promise((resolve, reject) => {
    if (suggest) {
      localStorage.setItem("suggesstions", JSON.stringify(suggesstions));
      resolve(suggesstions);
    } else {
      reject("Erreur serveur");
    }
  });
};

// --------------Event-----------------

theme.addEventListener("change", () => {
  document.documentElement.setAttribute("data-theme", theme.value);
});

form.addEventListener("submit", async (e) => {
  try {
    e.preventDefault();

    const suggest = {
      id: Date.now(),
      ttile: title.value.trim(),
      catSelect: catSelect.value,
      description: description.value,
    };

    await addSuggest(suggest);
    await saveSuggest(suggest);
    alert("Suggesstion créé avec succées");
    console.log(suggesstions);
  } catch (error) {
    console.log(`erreur lors de la creation du suggesstion ${error}`);
  }
});
