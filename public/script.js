let foods=document.querySelector("#foods");
let total_nutrients=document.querySelector("#total_nutrients");
let query=document.querySelector("#query");
let brand=document.querySelector("#brand");
let data=document.querySelector("#data");
let download_button=document.querySelector("#download_button");
let currentFoods=[];

function importFoods(input) {
  let file = input.files[0];

  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function() {
    console.log(JSON.parse(reader.result));
    console.log(currentFoods);

    currentFoods=JSON.parse(reader.result);
    renderFoods();
  };

  reader.onerror = function() {
    alert("File import failed.");
  };
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function setServings(idx) {
  let size=Number.parseFloat(prompt("Enter the amount of servings."));

  if (!Number.isNaN(size)) {
    currentFoods[idx].foodNutrients.serving_size=size;
  }
}

function renderFoods() {
  foods.innerHTML="";

  let nutrients=[];

  for (let idx in currentFoods) {
    let food=currentFoods[idx];

    if (!food.foodNutrients.serving_size) {
      food.foodNutrients.serving_size = 1.0;
    }

    let a="";
    a+="<div class='item'>"
    a+="<div class='description'>"+toTitleCase(food.description)+"</div>";
    a+="<div class='servingSize'>"+food.servingSize+food.servingSizeUnit+"</div>";
    a+="<div class='servings'>"+food.foodNutrients.serving_size+" serving(s)</div>";
    a+="<div class='brand'>"+food.brandOwner+"</div>";
    a+="<div class='ingredients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Ingredients<div><div>"+food.ingredients+"</div></div></div>";

    a+="<div class='nutrients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Nutrients";

    nutrients.push(food.foodNutrients);

    for (let nutrient of food.foodNutrients) {
      a+="<div><pre>"+JSON.stringify(nutrient, null, 2)+"</pre></div>";
    }
    a+="</div>";

    a+="<div class='raw_data noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Raw Data<div><pre>"+JSON.stringify(food, null, 2)+"</pre></div></div>";
    a+="<div class=\"config-buttons\">"
    a+=`<button class="serving-button" onclick="setServings(${idx}); renderFoods()">Servings</button>`
    a+=`<button class="remove-button" onclick="currentFoods.splice(${idx}, 1); renderFoods()">Remove</button>`
    a+="</div>"
    a+="</div>"

    foods.innerHTML+=a;
  }

  let totals={};
  for (let food of nutrients) {
    for (let nutrient of food) {
      if (!totals[nutrient.nutrient.name]) {
        totals[nutrient.nutrient.name]=0;
      }

      totals[nutrient.nutrient.name]+=nutrient.amount*food.serving_size;
    }
  }

  total_nutrients.innerHTML="<pre>"+JSON.stringify(totals, null, 2)+"</pre>";
}

function addFood(id) {
  foods.innerHTML+="<div>Loading, please wait...</div>";

  fetch(`/api?id=${id}`)
    .then((response) => response.json())
    .then((food) => {
      currentFoods.push(food);
      renderFoods();

      var file = new Blob([JSON.stringify(currentFoods, null, 2)], {type: "text/json"});
      download_button.href = URL.createObjectURL(file);
      download_button.download = "food_export.json";
    });
}

function renderData(e) {
  let a=""
  a+="<div class='hits'>Results: "+e.foods.length+" of "+e.hits+"</div>";

  for (let food of e.foods) {
    a+="<div class='item'>"
    a+="<div class='description'>"+toTitleCase(food.description)+"</div>";
    a+="<div class='servingSize'>"+food.servingSize+"</div>";
    a+="<div class='brand'>"+food.brand+"</div>";
    a+="<div class='ingredients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Ingredients<div><div>"+food.ingredients+"</div></div></div>";

    a+="<div class='nutrients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Nutrients";
    for (let nutrient of food.nutrients) {
      a+="<div>"+nutrient+"</div>";
    }
    a+="</div>";

    a+="<div class='raw_data noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Raw Data<div><pre>"+JSON.stringify(food, null, 2)+"</pre></div></div>";
    a+=`<button class="add-button" onclick="addFood(${food.fdcId})">Add Food</button>`
    a+="</div>"
  }

  data.innerHTML=a;
}

function submitQuery() {
  fetch(`/api?q="${query.value}"&p=1&brand=${brand.value}`)
    .then((response) => response.json())
    .then((d) => {
      let l={
        hits:d.totalHits,
        foods:d.foods.map(e=>{
          return {
            fdcId: e.fdcId,
            description: e.lowercaseDescription,
            brand: e.brandOwner,
            ingredients: e.ingredients,
            servingSize: e.servingSize+e.servingSizeUnit,
            nutrients: e.foodNutrients.map(e=>{
              return e.nutrientName+": "+e.value+e.unitName
            })
          }
        })
      }
      renderData(l);
    });
}

query.addEventListener("keyup", (e)=>{
  if (e.key=="Enter"){
    submitQuery();
  }
});

brand.addEventListener("keyup", (e)=>{
  if (e.key=="Enter"){
    submitQuery();
  }
});
