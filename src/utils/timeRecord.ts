export const timeRecord = (callback)=>{

  const startTime = Date.now();

  setInterval(() => callback(Date.now() - startTime),1000*60);
}