//const jsdom = require("node-jsdom");
require("global-jsdom/register");
// const { JSDOM } = jsdom;
var $, jq = require( "jquery" );
global.document = this.document;
global.window = this.window;
//global.window = {};
//global.window['location'] = {href: "someURL"};

/*
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window
*/

const sut = require('../src/index');


test('adds 1 + 2 to equal 3', () => {
  //sut.getSessionItem("ade");
  //sut("asd").
  expect((1 + 2)).toBe(3);
  
});