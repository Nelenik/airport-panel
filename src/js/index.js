import "../index.html";

import "../scss/index.scss";
import {Tag} from './js-parts/_helper.js'


const mult = (a, b) => a*b

console.log(mult(2,4))
console.log(mult(5,2))

const h1 = Tag.build({
  tagName: 'h1',
  text: 'how are you'
})
console.log(h1)