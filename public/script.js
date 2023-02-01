let query=document.querySelector("#query");
let brand=document.querySelector("#brand");
let data=document.querySelector("#data");
let debug_view=document.querySelector("#debug");
let debug={};

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function renderData(e) {
}

function submitQuery() {
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
