function getModelConstVal(typesName, givenType) {

  if (!typesName) {
    throw new Error('No typesName argument');  
  }

  if (!this[typesName]) {
    throw new Error('No types map with name:', typesName); 
  }

  let filteredObjects = this[typesName].filter((obj) => {

    let objKey = Object.keys(obj)[0];
    let objType = obj[objKey];
    
    return (givenType === objType);
  });

  let mappedObjectKeys = filteredObjects.map((obj) => {
    let objKey = Object.keys(obj);
    return objKey[0]; 
  });
 
  let resultValue = mappedObjectKeys[0]; 

  return resultValue;

}

module.exports = getModelConstVal;

