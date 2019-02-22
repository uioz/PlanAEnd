
const data = [],limite = 50;

let i = 0;

while(i<49){
  data.push(i);
  i++;
}

let
  len = data.length,
  baseNumber = limite || 500,
  num = 0,
  pros = [];


  
while (num * baseNumber < len && num + 1 * baseNumber < len) {
  pros.push(data.slice(num * baseNumber, ++num * baseNumber));
}
// 经过上面循环的一定不符合此条件,反之则符合该条件
if (len > num * baseNumber){
  pros.push(data);
}

// console.log(num + 1 * baseNumber < len)

console.log(num * baseNumber)

// pros.push(data.slice(num * baseNumber, ++num * baseNumber));

console.log(pros);