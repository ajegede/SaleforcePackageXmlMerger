
const convert = require('xml-js');
/**
 * PackageTypes class formats and merges tow packsages
 * formatTypes - sets all types in a package into one Array
 * mergeTypes - merges the types in a both packages together
 * fixFormat - returns the format used by xml-js and prepares merged data 
 * mergePackage - methods that runs merging
 * copyFormatted -  copy the merged xml to clipboard
 */
class PackageTypes{
    constructor(types){
        this.types=(!Array.isArray(types))?new Array(types): types;
    }
    formatTypes(){
        this.types.forEach(at=>{
            if(!Array.isArray(at.members)) at.members= new Array(at.members);
        })
        this.types.forEach(at=>{
            let mem = [];
            at.members.forEach((f)=>{
                mem.push(f._text);
            })
            at.members = mem;
           
        })
        return this;
    }
    mergeTypes(typesToAdd){
        typesToAdd.types.forEach(ata=>{
            let curItem= this.types.filter(f=>{return f.name._text === ata.name._text});
            if(curItem.length){
                curItem[0].members.push(...ata.members);
                curItem[0].members = [...new Set(curItem[0].members)]
                curItem[0].members.sort();
            }else{
                if(Array.isArray(ata)) ata.sort();
                this.types.push(ata);
            }
           
        })
        return this;
    }

    fixFormat(){
        this.types.forEach(e=>{
            e.members.forEach((m,i)=>{
               e.members[i]={_text:m}
            })
        })
        this.types.sort((a,b) => (a.name._text > b.name._text) ? 1 : ((b.name._text > a.name._text) ? -1 : 0))
        return this;
    }
}

window.mergePackage = function(){
  try {
    let returnTypesOnly = window.document.getElementById('returnTypesOnly').checked;
    
    let xml = window.document.getElementById('initial').value;
    let xml2 = window.document.getElementById('additional').value;
  
    var jsonRaw = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
    var json2Raw = JSON.parse(convert.xml2json(xml2, {compact: true, spaces: 4}));

    let initialPkg = new PackageTypes(jsonRaw.Package.types).formatTypes();
    let additional = new PackageTypes(json2Raw.Package.types).formatTypes();  
    
    let newTypes = initialPkg.mergeTypes(additional).fixFormat();
    jsonRaw.Package.types = [...newTypes.types];

    if(returnTypesOnly){
      jsonRaw = newTypes;
    }
  
    var jsonRawXML = convert.json2xml(jsonRaw, {compact: true, spaces: 4});
    
    window.document.getElementById('newPackage').value=jsonRawXML;
  } catch (error) {
    window.document.getElementById('newPackage').value='Error occurred. Pass appropriate values as XML Package. Check the console for error details';
    console.log(error.message);
    console.log(error.stack);
  }
   
}

window.copyFormatted = function() {
  var copyText = document.getElementById("newPackage");
  copyText.select();
  // navigator.clipboard.writeText(copyText.value);
  document.execCommand('copy');
}

module.exports={
  mergePackage,
  copyFormatted
}