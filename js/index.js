(function() {
  function clearItemsList() {
    $("#ItemsListContainer").empty();
  }

  function clearAddNewItemInputs() {
    $("#AddNewItemContainer").find("input").val("");
  }

  function createItemInput(name, label, cssClasses, value) {
    var addCssClasses = cssClasses ? cssClasses : "",
        valueOrPlaceholder = !value ? 'placeholder="' + label + '"' : 'value="' + value + '"';
    return '<input type="text" class="item-' + name + ' ' + addCssClasses + '" ' + valueOrPlaceholder + ' />';
  }

  function createItemActionBtn(action, label, cssClasses, icon) {
    var addCssClasses = cssClasses ? cssClasses : "",
        addIcon = icon ? '<span class="glyphicon ' + icon + '" aria-hidden="true"></span>' : "";
    return '<button type="button" class="' + action + '-item ' + addCssClasses + '">' + label + addIcon + '</button>';
  }

  function renderAddNewItemInputs() {
    var itemElsGroup = $('<form id="AddNewItemForm" class="form-inline"><div class="form-group">' + 
                          createItemInput("title", "Name", "form-control form-control-inline") + 
                          createItemInput("url", "URL", "form-control form-control-inline") + 
                          createItemActionBtn("add", "Enter", "btn btn-primary btn-lg") + 
                        '</div></form>');
    itemElsGroup.appendTo("#AddNewItemContainer");
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
          var itemElsGroup =  '<div class="input-group col-sm-10">' + 
                                createItemInput("title", "Title", "form-control", val.attributes.title) + 
                                createItemInput("url", "URL", "form-control", val.attributes.url) + 
                              '</div>' +
                              '<div class="button-group col-sm-2">' + 
                                createItemActionBtn("update", "", "btn-icon", "glyphicon-pencil") + 
                                createItemActionBtn("delete", "", "btn-icon", "glyphicon-trash") +
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
  function postNewItem(title = "Title", url = "URL") {
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
      $("#MessageContainer > div").removeClass().addClass("alert alert-danger").text("Sorry, adding a new item failed.");
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
      //console.log($(this));
      var itemTitle = $(this).siblings(".item-title").val();
      var itemUrl = $(this).siblings(".item-url").val();
      // console.log(itemTitle);
      // console.log(itemUrl);
      postNewItem(itemTitle, itemUrl);
    });

    $("#ItemsListContainer").on("click", ".update-item", function(e) {
      e.preventDefault();
      var itemId = $(this).closest(".list-item").data("id");
      var itemTitle = $(this).siblings(".item-title").val();
      var itemUrl = $(this).siblings(".item-url").val();
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