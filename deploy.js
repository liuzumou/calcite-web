// ┌───────────────┐
// │ Deploy Script │
// └───────────────┘
// Builds a json file with all site content

var fs   = require('fs');
var jf   = require('jsonfile');
var path = require('path');
var yaml = require('js-yaml');

var file = 'docs/build/content.json';
var response = {
  elements: [],
  colors: []
};

function constructItem(content, meta) {

  var item = {
    _id: content.id,
    title: content.title,
    slug: content.link,
    tags: ['calcite-web', 'web', content.title, meta.group, meta.page, meta.page_slug],
    sort_order: meta.order
  }

  var markdownPath = path.join('docs', 'source', meta.page_slug, '_' + item.slug + '.md');
  var markdown = fs.readFileSync(markdownPath, 'utf8');

  item.description = JSON.stringify(markdown);

  if (content.modifiers) {
    item.modifiers = content.modifiers;
    var samplePath = path.join('docs', 'source', meta.page_slug, 'sample-code', '_' + item.slug + '.html');
    var sample = fs.readFileSync(samplePath, 'utf8');
    item.sample_code = JSON.stringify(sample);
  }

  if (meta.group == 'Palette') {
    response.colors.push(item);
  } else {
    response.elements.push(item);
  }

}

var contents = yaml.safeLoad(fs.readFileSync('docs/source/table_of_contents.yml', 'utf8'));
var counter = 0;

for (var key in contents) {
  var meta = {
    page: contents[key].title,
    page_slug: contents[key].base,
    page_order: counter
  };
  contents[key].navigation.forEach(function (group, index){
    meta.group = group.group;
    meta.group_order = index;

    var orderArray = [];

    for (var i = group.pages.length; i > 0; i--) {
      orderArray.push(i);
    }

    group.pages.forEach(function (element, i){
      meta.order = orderArray[i];
      if (element.title == 'Overview') {
        meta.order == 100;
      }
      constructItem(element, meta);
    });
  });
  counter++;
}

jf.writeFileSync(file, response);

module.exports.guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    var id = v.toString(16);
    console.log(id);
    return id;
  });
};
