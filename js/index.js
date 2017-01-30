(function() {
  function clearItemsList() {
    $("#ItemsListContainer").empty();
  }

  function clearAddNewItemInputs() {
    $("#AddNewItemContainer").find("input").val("");
  }

  function createItemInput(name, label, cssClasses, readOnly, value) {
    var addCssClasses = cssClasses ? cssClasses : ''
        valueOrPlaceholder = !value ? 'placeholder="' + label + '"' : 'value="' + value + '"',
        isReadOnly = readOnly ? 'disabled="disabled"' : '';
    return '<input type="text" class="item-' + name + ' ' + addCssClasses + '" ' + valueOrPlaceholder + ' ' + isReadOnly + ' />';
  }

  function createItemActionBtn(action, label, cssClasses, icon, titleTip) {
    var addCssClasses = cssClasses ? cssClasses : "",
        showTitleTip = titleTip ? 'title="' + titleTip + '"' : '',
        addIcon = icon ? '<span class="glyphicon ' + icon + '" aria-hidden="true"></span>' : "";
    return  '<button type="button" ' + 
              showTitleTip + 
              ' class="' + action + '-item ' + 
              addCssClasses + '">' + label + addIcon + 
            '</button>';
  }

  function renderAddNewItemInputs() {
    var itemElsGroup = $('<form id="AddNewItemForm" class="form-inline row">' + 
                            '<div class="form-group col-sm-3">' + 
                              createItemInput("title", "Name", "form-control") +
                            '</div>' + 
                            '<div class="form-group col-sm-7">' + 
                              createItemInput("url", "URL", "form-control") +
                            '</div>' + 
                            createItemActionBtn("add", "Enter", "btn btn-primary btn-lg") + 
                          '</form>');
    itemElsGroup.appendTo("#AddNewItemContainer");
  }

  function resetEditStateOnAllOtherItems() {
    $("#ItemsList .list-item input").attr("disabled", "disabled");
    $("#ItemsList .list-item button:first-child").removeClass().addClass("edit-item btn-icon");
    $("#ItemsList .list-item button:first-child").attr("title", "Edit");
    $("#ItemsList .list-item button:first-child > span").removeClass().addClass("glyphicon glyphicon-pencil");
  }

  function toggleEditSaveIcon(item) {
    //console.log(item);
    $(item).find("button:first-child").removeClass("edit-item").addClass("update-item");
    $(item).find("button:first-child").attr("title", "Save");
    $(item).find("button:first-child > span").removeClass("glyphicon-pencil").addClass("glyphicon-floppy-disk");
  }

  function editItem(item, title, url) {
    //console.log(item);
    //console.log(title);
    //console.log(url);
    $(title).removeAttr("disabled");
    $(url).removeAttr("disabled");
    toggleEditSaveIcon($(item));
  }

  $.ajaxSetup({
    //dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "455fd78df48d4cd7f32a008259ed569d");
    }
  });

  //// GET
  function getAllItems() {
    $.ajax({
      type: "GET",
      url: "https://clientside-api.herokuapp.com/api/v1/listings/",
    })
    .done(function(resp, textStatus) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      //console.log("JSON Stringified resp/data:", JSON.stringify(resp));
      //console.log("Parsed JSON Response:", $.parseJSON(resp));
      //$("<div>").text(textStatus + ": " + JSON.stringify(resp)).appendTo("#ItemsListContainer");
      var items = [];          
      $.each(resp, function() {
        $.each(resp.data, function(key, val) {
          var itemElsGroup =  '<div class="input-group col-sm-9">' + 
                                createItemInput("title", "Title", "form-control", true, val.attributes.title) + 
                                createItemInput("url", "URL", "form-control", true, val.attributes.url) + 
                              '</div>' +
                              '<div class="button-group col-sm-3">' + 
                                createItemActionBtn("edit", "", "btn-icon", "glyphicon-pencil", "Edit") +
                                createItemActionBtn("delete", "", "btn-icon", "glyphicon-trash", "Delete") +
                                //createItemActionBtn("update", "", "btn-icon", "glyphicon-pencil") + 
                              '</div>';
           items.push('<li class="list-item col-sm-6" data-id="' + val.id + '"><div class="form-group row">' +
                         //key + ': ' + JSON.stringify(val) + '<br />' + 
                         itemElsGroup + 
                       '</div></li>');
        });
      });
      $("<form>", {"id": "ItemsListForm"}).appendTo("#ItemsListContainer");
      $("<ul>", {
        "id": "ItemsList",
        "class": "row",
        html: items.join("")
      }).appendTo("#ItemsListForm");
    })
    .fail(function(resp, textStatus, errorThrown) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      // console.log("errorThrown:", errorThrown);      
      $("#MessageContainer > div").removeClass().addClass("alert alert-danger").text(textStatus + ": " + errorThrown + " - " + JSON.stringify(resp));
    });
  }

  //// POST
  function postNewItem(title, url) {
    var model = {
      data: {
        attributes: {
          title: title,
          url: url
        }
      }
    };

    $.ajax({
      type: "POST",
      url: "https://clientside-api.herokuapp.com/api/v1/listings/",
      data: model
    })
    .done(function(resp, textStatus) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      clearAddNewItemInputs();
      clearItemsList();
      $("#MessageContainer > div").removeClass().addClass("alert alert-success").text("Successfully added a new item.");
      getAllItems();
    })
    .fail(function(resp, textStatus, errorThrown) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      // console.log("errorThrown:", errorThrown);
      clearItemsList();
      $("#MessageContainer > div").removeClass().addClass("alert alert-danger").text("Sorry, adding a new item failed. The Name and URL fields are both required values.");
      getAllItems();
    });
  }

  //// PUT
  function updateItem(id, title, url) {
    var model = {
      data: {
        attributes: {
          title: title,
          url: url
        }
      }
    };
    $.ajax({
      type: "PUT",
      url: "https://clientside-api.herokuapp.com/api/v1/listings/" + id,
      data: model
    })
    .done(function(resp, textStatus) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      clearItemsList();
      $("#MessageContainer > div").removeClass().addClass("alert alert-success").text("Successfully updated item ID: " + id);
      getAllItems();
    })
    .fail(function(resp, textStatus, errorThrown) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      // console.log("errorThrown:", errorThrown);
      clearItemsList();
      $("#MessageContainer > div").removeClass().addClass("alert alert-danger").text("Sorry, failed to update item ID: " + id);
      getAllItems();
    });
  }

  //// DELETE
  function deleteItem(id) {
    $.ajax({          
      type: "DELETE",
      url: "https://clientside-api.herokuapp.com/api/v1/listings/" + id,
    })
    .done(function(resp, textStatus) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      clearItemsList();
      $("#MessageContainer > div").removeClass().addClass("alert alert-success").text("Successfully deleted item ID: " + id);
      getAllItems();
    })
    .fail(function(resp, textStatus, errorThrown) {
      // console.log("resp:", resp);
      // console.log("textStatus:", textStatus);
      // console.log("errorThrown:", errorThrown);
      clearItemsList();
      $("#MessageContainer > div").removeClass().addClass("alert alert-danger").text("Sorry, failed to delete item ID: " + id);
      getAllItems();
    });
  }

  $(function() {
    renderAddNewItemInputs();
    getAllItems();

    $("#AddNewItemContainer").on("click", ".add-item", function(e) {
      e.preventDefault();
      var itemTitle = $("#AddNewItemForm .item-title").val();
      var itemUrl = $("#AddNewItemForm .item-url").val();
      // console.log(itemTitle);
      // console.log(itemUrl);
      postNewItem(itemTitle, itemUrl);
    });

    $("#ItemsListContainer").on("click", ".edit-item", function(e) {
      e.preventDefault();
      resetEditStateOnAllOtherItems();
      var thisItem = $(this).closest(".list-item");
      var itemId = $(thisItem).data("id");
      var itemTitle = $(thisItem).find(".item-title");
      var itemUrl = $(thisItem).find(".item-url");
      // console.log(itemTitle);
      // console.log(itemUrl);
      editItem(thisItem, itemTitle, itemUrl);
    });

    $("#ItemsListContainer").on("click", ".update-item", function(e) {
      e.preventDefault();
      var thisItem = $(this).closest(".list-item");
      var itemId = $(thisItem).data("id");
      var itemTitle = $(thisItem).find(".item-title").val();
      var itemUrl = $(thisItem).find(".item-url").val();
      // console.log(itemTitle);
      // console.log(itemUrl);
      updateItem(itemId, itemTitle, itemUrl);
    });

    $("#ItemsListContainer").on("click", ".delete-item", function(e) {
      e.preventDefault();
      var itemId = $(this).closest(".list-item").data("id");
      deleteItem(itemId);
    });

  });  
})();