/*
This file is dedicated to all the functions that are related to bookmarks section.
*/

function loadBookmarks() {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    generateBookmarks(bookmarkTreeNodes[0].children, $("#bookmarksList"));
  });
}

function generateBookmarks(bookmarkNodes, parent) {
  for (const node of bookmarkNodes) {
    createListItem(parent, node);
  }
}

function createListItem(parent, node) {
  const li = $("<li>");

  if (node.children) {
    const folderIcon = "📁 ";
    li.text(folderIcon + node.title);

    const nestedList = $("<ul>", { class: "nested" });
    for (const child of node.children) {
      createListItem(nestedList, child);
    }
    li.append(nestedList);
    li.on("click", function (event) {
      event.stopPropagation();
      $(".nested")
        .not(nestedList.parentsUntil("#bookmarksList"))
        .not(nestedList)
        .hide();
      nestedList.toggle();
    });
  } else if (node.url) {
    const faviconUrl = getFaveiconURL(node.url, 12);
    const faviconImg = $("<img>", { alt: "Favicon", src: faviconUrl });
    li.append(faviconImg);
    li.append(node.title);

    li.on("click", function () {
      window.open(node.url, "_self");
    });
  }

  parent.append(li);
}
