jQuery(document).ready(function($) {
	$.capitalcityquiz = {};
	$.capitalcityquiz.data = {};
	$.capitalcityquiz.resources_url = "resources/";
	$.capitalcityquiz.number_of_questions = 5;
	
	$.capitalcityquiz.parent_template = $("#capital-city-quiz-parent-template");
	$.capitalcityquiz.start_template = $("#capital-city-quiz-start-template");
	$.capitalcityquiz.enter_template = $("#capital-city-quiz-enter-template");
	$.capitalcityquiz.finished_template = $("#capital-city-quiz-finished-template");
	$.capitalcityquiz.saved_template = $("#capital-city-quiz-saved-template");
	$.capitalcityquiz.configuration_template = $("#capital-city-quiz-configuration-template");
	$.capitalcityquiz.failed_to_load_data_template = $("#capital-city-quiz-failed-to-load-data-template");
	
	$.capitalcityquiz.setup = function($this) {
		$this = $($this);
		
		$this.html($.capitalcityquiz.parent_template.html());
		
		if(!$.capitalcityquiz.supportsStorage($this))
			$this.find(".capital-city-quiz-view-saved").remove();
		
		// Load country data
		if(!$.capitalcityquiz.loadData())
			return $.capitalcityquiz.renderFailedToLoadDataTemplate($this);
		
		// Get five countries
		var countries = [];
		$.each($.capitalcityquiz.getCountries($.capitalcityquiz.getNumberOfQuestions($this)), function(key, value) {
			countries.push({
				iso2: value,
				name: $.capitalcityquiz.getCountryName(value),
				capital: $.capitalcityquiz.getCapitalCity(value),
				attempts: 0,
				cheated: false,
				done: false
			});
		});
		
		$this.data("capitalcityquiz-countries", countries);
		$.capitalcityquiz.setScore($this, 0);
		$this.data("capitalcityquiz-saved", false);
		
		$.capitalcityquiz.renderStartTemplate($this, countries.length);
	};
	
	$.capitalcityquiz.loadData = function(reload) {
		if(!$.capitalcityquiz.data.names || !$.capitalcityquiz.data.capital || reload)
		
		if(!$.capitalcityquiz.data.names || reload)
			$.ajax({
				url: $.capitalcityquiz.resources_url + "names.json",
				method: "GET",
				async: false,
				success: function(response) {
					$.capitalcityquiz.data.names = response;
				},
				error: function() {
					$.capitalcityquiz.data.names = false;
				}
			});
		
		if(!$.capitalcityquiz.data.capital || reload)
			$.ajax({
				url: $.capitalcityquiz.resources_url + "capital.json",
				method: "GET",
				async: false,
				success: function(response) {
					$.capitalcityquiz.data.capital = response;
				},
				error: function() {
					$.capitalcityquiz.data.capital = false;
				}
			});
		
		return $.capitalcityquiz.data.names && $.capitalcityquiz.data.capital;
	};
	
	$.capitalcityquiz.getNumberOfQuestions = function($this) {
		var number_of_questions = $this.attr("data-capitalcityquiz-number-of-questions");
		
		if(typeof number_of_questions == "string") {
			number_of_questions = parseInt(number_of_questions);
			if((typeof number_of_questions == "number") && (number_of_questions != NaN))
				return number_of_questions;
		}
		
		$this.attr("data-capitalcityquiz-number-of-questions", $.capitalcityquiz.number_of_questions);
		return $.capitalcityquiz.number_of_questions;
	};
	
	$.capitalcityquiz.getCountries = function(number) {
		var countries = [];
		
		// Filter countries that don't have a capital city
		$.each($.capitalcityquiz.data.names, function(iso2, name) {
			if($.capitalcityquiz.data.capital[iso2] && ($.capitalcityquiz.data.capital[iso2].length >= 1))
				countries.push(iso2);
		});
		
		countries.sort(function(a, b) {
			return 0.5 - Math.random();
		});
		
		return countries.splice(0, 5);
	};
	$.capitalcityquiz.getCountryName = function(iso2) {
		return $.capitalcityquiz.data.names[iso2];
	};
	$.capitalcityquiz.getCapitalCity = function(iso2) {
		return $.capitalcityquiz.data.capital[iso2];
	};
	
	$.capitalcityquiz.getAnswer = function($this, question_number) {
		var countries = $this.data("capitalcityquiz-countries");
		return countries[question_number].capital;
	};
	
	$.capitalcityquiz.getCounter = function($this, question_number) {
		var countries = $this.data("capitalcityquiz-countries");
		return countries[question_number].attempts;
	};
	$.capitalcityquiz.incrementCounter = function($this, question_number) {
		var countries = $this.data("capitalcityquiz-countries");
		countries[question_number].attempts++;
		$this.data("capitalcityquiz-countries", countries);
		return countries[question_number].attempts;
	};
	$.capitalcityquiz.setCheated = function($this, question_number) {
		var countries = $this.data("capitalcityquiz-countries");
		countries[question_number].cheated = true;
		$this.data("capitalcityquiz-countries", countries);
	};
	$.capitalcityquiz.setQuestionComplete = function($this, question_number) {
		var countries = $this.data("capitalcityquiz-countries");
		countries[question_number].done = true;
		$this.data("capitalcityquiz-countries", countries);
		return countries[question_number].attempts;
	};
	
	$.capitalcityquiz.getScore = function($this) {
		return $this.data("capitalcityquiz-score");
	}
	$.capitalcityquiz.setScore = function($this, score) {
		$this.data("capitalcityquiz-score", score);
		$.capitalcityquiz.updateScore($this);
	};
	$.capitalcityquiz.incrementScore = function($this, add) {
		var score = $this.data("capitalcityquiz-score");
		score += add;
		$this.data("capitalcityquiz-score", score);
		$.capitalcityquiz.updateScore($this);
		return score;
	};
	$.capitalcityquiz.updateScore = function($this) {
		var score = $this.data("capitalcityquiz-score");
		$this.find(".capital-city-quiz-score-1").text(score);
		$this.find(".capital-city-quiz-score-s").text(score != 1 ? "s" : "");
	};
	
	$.capitalcityquiz.getStorageToken = function($this) {
		return $this.attr("data-capitalcityquiz-storage-token");
	};
	$.capitalcityquiz.supportsStorage = function($this) {
		return $.capitalcityquiz.getStorageToken($this) && window.localStorage;
	};
	$.capitalcityquiz.save = function($this, name) {
		if(!$.capitalcityquiz.supportsStorage($this))
			return false;
		
		var storage_token = $.capitalcityquiz.getStorageToken($this),
			finished_timestamp = $this.data("capitalcityquiz-finished-timestamp"),
			storage = JSON.parse(window.localStorage.capitalcityquiz || "{}") || {};
		
		storage = storage || {};
		storage[storage_token + "_saved"] = storage[storage_token + "_saved"] || [];
		
		storage[storage_token + "_saved"].push({
			name: name,
			timestamp: finished_timestamp,
			data: $this.data("capitalcityquiz-countries"),
			score: $this.data("capitalcityquiz-score")
		});
		window.localStorage.capitalcityquiz = JSON.stringify(storage);
		$this.data("capitalcityquiz-saved", true);
		return true;
	};
	$.capitalcityquiz.getSaved = function($this) {
		if(!$.capitalcityquiz.supportsStorage($this))
			return false;
		
		var storage_token = $.capitalcityquiz.getStorageToken($this),
			storage = JSON.parse(window.localStorage.capitalcityquiz || "{}") || {};
		
		if(!storage || !storage[storage_token + "_saved"])
			return [];
		
		return storage[storage_token + "_saved"];
	};
	$.capitalcityquiz.showSaved = function($this) {
		var saved = $.capitalcityquiz.getSaved($this);
		
		if(saved.length < 1) {
			$.capitalcityquiz.message($this, "info", "There is no saved scores.");
			return;
		}
		
		saved.sort(function(a, b) {
			if(a.timestamp > b.timestamp)
				return -1;
			else if(a.timestamp < b.timestamp)
				return 1;
			else return 0;
		});
		
		$.capitalcityquiz.renderSavedTemplate($this, saved);
	};
	$.capitalcityquiz.clearSaved = function($this) {
		if(!$.capitalcityquiz.supportsStorage($this))
			return false;
		
		var storage_token = $.capitalcityquiz.getStorageToken($this),
			finished_timestamp = $this.data("capitalcityquiz-finished-timestamp"),
			storage = JSON.parse(window.localStorage.capitalcityquiz) || {};
		
		storage = storage || {};
		storage[storage_token + "_saved"] = [];
		
		window.localStorage.capitalcityquiz = JSON.stringify(storage);
		$this.data("capitalcityquiz-saved", false);
		return true;
	};
	
	$.capitalcityquiz.message = function($this, type, message) {
		var $scrollparent = $this.find(".capital-city-quiz-container").scrollParent(),
			scrolltop = $scrollparent.scrollTop(),
			messagesheight = $this.find(".capital-city-quiz-messages").outerHeight(true),
			$message = $("<p class=\"alert alert-" + type + " fade in\"><button class=\"close\" type=\"button\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>" + message + "</p>");
		window.setTimeout(function() {
			$message.alert("close");
		}, 5000);
		$this.find(".capital-city-quiz-messages").append($message);
		$scrollparent.scrollTop(scrolltop + ($this.find(".capital-city-quiz-messages").outerHeight(true) - messagesheight));
	};
	$.capitalcityquiz.clearMessages = function($this) {
		$this.find(".capital-city-quiz-messages").html("");
	};
	
	$.capitalcityquiz.showStartPage = function($this) {
		$.capitalcityquiz.renderStartTemplate($this);
	};
	
	$.capitalcityquiz.showNextQuestion = function($this) {
		var countries = $this.data("capitalcityquiz-countries"),
			current_question_number = parseInt($this.attr("data-capitalcityquiz-question-number")),
			next_question;
		
		if((typeof current_question_number != "number") || (current_question_number == NaN))
			current_question_number = 0;
		
		$.each(countries, function(key, value) {
			if(value.done)
				return;
			
			next_question = value;
			next_question.key = key;
			return false;
		});
		
		if(typeof next_question != "object")
			return $.capitalcityquiz.showFinishedPage($this);
		
		$.capitalcityquiz.renderInputTemplate($this, next_question.key, next_question);
	};
	
	$.capitalcityquiz.showFinishedPage = function($this) {
		var countries = $this.data("capitalcityquiz-countries");
		
		$this.data("capitalcityquiz-finished-timestamp", Date.now());
		
		$.capitalcityquiz.renderFinishedTemplate($this, countries);
	};
	
	$.capitalcityquiz.showConfiguration = function($this) {
		var countries = $this.data("capitalcityquiz-countries"),
			selected_countries = [];
		
		$.each(countries, function(key, value) {
			selected_countries.push(value.iso2);
		});
		
		console.log(selected_countries);
		
		$.capitalcityquiz.renderConfigurationTemplate($this, selected_countries);
	};
	
	$.capitalcityquiz.renderStartTemplate = function($this, number_of_questions) {
		$this.attr("data-capitalcityquiz", "template-start");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").hide().on("click", function() {
			$.capitalcityquiz.setup($this);
		});
		$this.find(".capital-city-quiz-view-saved").show().on("click", function() {
			$.capitalcityquiz.showSaved($this);
		});
		$this.find(".capital-city-quiz-configuration").show().on("click", function() {
			$.capitalcityquiz.showConfiguration($this);
		});
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.start_template.html());
		$this.find(".capital-city-quiz-start").on("click", function() {
			$.capitalcityquiz.showNextQuestion($this);
		});
		
		if(number_of_questions != 5)
			$this.find(".capital-city-quiz-p1").text(number_of_questions + " random questions have been selected.");
	};
	
	$.capitalcityquiz.renderInputTemplate = function($this, question_number, country) {
		$this.attr("data-capitalcityquiz", "template-input").attr("data-capitalcityquiz-question-number", question_number).attr("data-capitalcityquiz-country", country.iso2);
		$this.find(".capital-city-quiz-question-number").show().text("Question " + (question_number + 1) + "/" + $.capitalcityquiz.getNumberOfQuestions($this));
		$this.find(".capital-city-quiz-score").show();
		$this.find(".capital-city-quiz-restart").show();
		$this.find(".capital-city-quiz-view-saved").hide();
		$this.find(".capital-city-quiz-configuration").hide();
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.enter_template.html());
		$this.find(".capital-city-quiz-country-name").text(country.name);
		$this.find("input").each(function() {
			$(this).attr("placeholder", $(this).attr("placeholder").replace(/{{country_name}}/i, country.name));
		});
		$this.find("form").on("submit", function(event) {
			event.preventDefault();
			var $input = $this.find(".form-control"),
				counter = $.capitalcityquiz.incrementCounter($this, question_number);
			
			if(country.cheated) {
				$.capitalcityquiz.setQuestionComplete($this, question_number);
				$.capitalcityquiz.showNextQuestion($this);
   			} else if(removeDiacritics($input.val().toLowerCase()) == removeDiacritics(country.capital.toLowerCase())) {
				// Correct
				if(counter == 1) {
					$.capitalcityquiz.message($this, "success", "Correct first time! +3 points");
					$.capitalcityquiz.incrementScore($this, 3);
				} else if(counter == 2) {
					$.capitalcityquiz.message($this, "success", "Correct second time! +2 points");
					$.capitalcityquiz.incrementScore($this, 2);
				} else {
					$.capitalcityquiz.message($this, "success", "Correct after " + counter + " attempts! +1 point");
					$.capitalcityquiz.incrementScore($this, 1);
				}
				
				$.capitalcityquiz.setQuestionComplete($this, question_number);
				$.capitalcityquiz.showNextQuestion($this);
			} else {
				// Incorrect
				$.capitalcityquiz.message($this, "danger", "Incorrect");
				
				if(counter == 5) {
					$this.find("form .btn-group").append($("<button></button>").addClass("btn").addClass("btn-default").attr("type", "button").text("Give up").on("click", function() {
						if(!confirm("Are you sure? You won't get any points."))
							return;
						
						$.capitalcityquiz.setCheated($this, question_number);
						$input.val(country.capital).prop("disabled", true);
					}));
				}
			}
			
			$input.val("").focus();
			return false;
		});
		$this.find(".form-control:first").focus();
	};
	
	$.capitalcityquiz.renderFinishedTemplate = function($this, countries) {
		$this.attr("data-capitalcityquiz", "template-finished");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").show();
		$this.find(".capital-city-quiz-view-saved").show();
		$this.find(".capital-city-quiz-configuration").hide();
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.finished_template.html());
		$.capitalcityquiz.updateScore($this);
		
		var $tbody = $this.find(".capital-city-quiz-overview-table");
		
		$.each(countries, function(key, country) {
			var $tr = $("<tr></tr>").appendTo($tbody);
			
			if(!country.done)
				$tr.addClass("text-muted");
			if(country.cheated)
				$tr.addClass("danger");
			
			$tr.append($("<td></td>").text("What is the capital city of " + country.name + "?"));
			$tr.append($("<td></td>").text(country.capital));
			$tr.append($("<td></td>").text(country.attempts));
		});
		
		var date = new Date($this.data("capitalcityquiz-finished-timestamp"));
		
		$this.find("form .form-control[name='timestamp']").val(date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
		
		$this.find("form").on("submit", function(event) {
			event.preventDefault();
			var $name = $this.find(".form-control"),
				name = $name.val();
			
			if(name.length < 1) {
				$.capitalcityquiz.message($this, "info", "You need to enter your name to save your score.");
			} else if($.capitalcityquiz.save($this, name)) {
				$.capitalcityquiz.message($this, "success", "Your score was saved.");
				$this.find(".capital-city-quiz-save").remove();
			} else {
				$.capitalcityquiz.message($this, "warning", "There was an error saving your score.");
				$input.val("").focus();
			}
			
			return false;
		});
	};
	
	$.capitalcityquiz.renderSavedTemplate = function($this, saved) {
		$this.attr("data-capitalcityquiz", "template-saved");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").show().text("Back");
		$this.find(".capital-city-quiz-view-saved").hide();
		$this.find(".capital-city-quiz-configuration").hide();
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.saved_template.html());
		
		$this.find(".capital-city-quiz-saved-done").on("click", function() {
			$.capitalcityquiz.showStartPage($this);
		});
		$this.find(".capital-city-quiz-clear-saved").on("click", function() {
			$.capitalcityquiz.clearSaved($this);
		});
		
		$.each(saved, function(key, save) {
			var $div = $("<div></div>").css("border-bottom", "solid 1px #eeeeee").css("margin-bottom", "20px").appendTo($this.find(".capital-city-quiz-saved")),
				$table = $("<table></table>").addClass("table"),
				date = new Date(save.timestamp);
			
			$("<h4></h4>").text(save.name + ", " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()).appendTo($div);
			$("<p></p>").append($("<b></b>").text(save.score + " point" + (save.score != 1 ? "s" : ""))).appendTo($div);
			$table.appendTo($div);
			
			$("<thead></thead>").append($("<tr></tr>").append($("<th></th>").text("Question")).append($("<th></th>").text("Answer")).append($("<th></th>").text("Attempts"))).appendTo($table);
			
			var $tbody = $("<tbody></tbody>").appendTo($table);
			
			$.each(save.data, function(key, country) {
				var $tr = $("<tr></tr>").appendTo($tbody);
				
				if(!country.done)
					$tr.addClass("text-muted");
				if(country.cheated)
					$tr.addClass("danger");
				
				$tr.append($("<td></td>").text("What is the capital city of " + country.name + "?"));
				$tr.append($("<td></td>").text(country.capital));
				$tr.append($("<td></td>").text(country.attempts));
			});
		});
		
		$this.find(".capital-city-quiz-saved > *:last").css({
			"border-bottom": "none 0px",
			"margin-bottom": "0px"
		});
	};
	
	$.capitalcityquiz.renderConfigurationTemplate = function($this, selected_countries) {
		$this.attr("data-capitalcityquiz", "template-configuration");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").show().text("Use defaults").on("click", function() {
			$this.attr("data-capitalcityquiz-number-of-questions", null);
		});
		$this.find(".capital-city-quiz-view-saved").hide();
		$this.find(".capital-city-quiz-configuration").hide();
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.configuration_template.html());
		
		var $tbody = $this.find(".capital-city-quiz-countries-table"),
			$unselected_tbody = $this.find(".capital-city-quiz-unselected-countries-table"),
			$selected_tbody = $this.find(".capital-city-quiz-selected-countries-table");
		
		$.each($.capitalcityquiz.data.names, function(iso2, country_name) {
			var $tr = $("<tr></tr>").attr("data-capitalcityquiz-country-iso2", iso2);
			
			$tr.append($("<td></td>").html("<span class=\"capital-city-quiz-drag-handle\"><span class=\"glyphicon glyphicon-resize-vertical\"></span></span><a class=\"capital-city-quiz-add\" href=\"javascript:\"><span class=\"glyphicon glyphicon-plus\"></span></a><a class=\"capital-city-quiz-remove\" href=\"javascript:\"><span class=\"glyphicon glyphicon-minus\"></span></a>"));
			$tr.append($("<td></td>").text(iso2));
			$tr.append($("<td></td>").text(country_name));
			$tr.append($("<td></td>").text($.capitalcityquiz.getCapitalCity(iso2)));
			
			if($.inArray(iso2, selected_countries) != -1)
				$tr.appendTo($selected_tbody).find(".capital-city-quiz-add").hide();
			else $tr.appendTo($unselected_tbody).find(".capital-city-quiz-remove").hide();
			
			$tr.find(".capital-city-quiz-add").on("click", function() {
				$(this).hide().next().show().parent().parent().detach().appendTo($selected_tbody);
			});
			$tr.find(".capital-city-quiz-remove").on("click", function() {
				$(this).hide().prev().show().parent().parent().detach().prependTo($unselected_tbody);
			});
		});
		
		$tbody.sortable({
			connectWith: ".capital-city-quiz-countries-table",
			handle: ".capital-city-quiz-drag-handle",
			helper: function(e, ui) {
				ui.children().each(function() {
					$(this).width($(this).width());
				});
				return ui;
			},
			change: function(event, ui) {
				var $tr = ui.item,
					$placeholder = ui.placeholder,
					is_selected = $placeholder.parent().hasClass("capital-city-quiz-selected-countries-table");
				
				if(is_selected)
					$tr.find(".capital-city-quiz-add").hide().next().show();
				else $tr.find(".capital-city-quiz-remove").hide().prev().show();
				
				$placeholder.html("<td></td><td></td><td></td><td></td>");
			}
		});
		
		$this.find(".capital-city-quiz-clear-configuration").on("click", function() {
			$selected_tbody.children("[data-capitalcityquiz-country-iso2]").detach().prependTo($unselected_tbody).find(".capital-city-quiz-remove").hide().prev().show();
		});
		
		$this.find(".capital-city-quiz-cancel-configuration").on("click", function() {
			$.capitalcityquiz.setup($this);
		});
		
		$this.find("form").on("submit", function(event) {
			event.preventDefault();
			var $tbody = $this.find(".capital-city-quiz-countries-table"),
				countries = [];
			
			$selected_tbody.children("[data-capitalcityquiz-country-iso2]").each(function(key, value) {
				var $tr = $(this),
					iso2 = $tr.attr("data-capitalcityquiz-country-iso2");
				
				countries.push({
					iso2: iso2,
					name: $.capitalcityquiz.getCountryName(iso2),
					capital: $.capitalcityquiz.getCapitalCity(iso2),
					attempts: 0,
					cheated: false,
					done: false
				});
			});
			
			if(countries.length < 1) {
				$.capitalcityquiz.message($this, "warning", "You must set at least one country.");
				return false;
			}
			
			// Reset this instance and load selected data
			$this.attr("data-capitalcityquiz-number-of-questions", countries.length);
			$.capitalcityquiz.setup($this);
			$this.data("capitalcityquiz-countries", countries);
			$this.find(".capital-city-quiz-p1").text("You've picked " + countries.length + " countr" + (countries.length == 1 ? "y" : "ies") + ".");
			
			console.log(countries);
			
			return false;
		});
	};
	
	$.capitalcityquiz.renderFailedToLoadDataTemplate = function($this) {
		$this.attr("data-capitalcityquiz", "template-failed-to-load-data");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").hide();
		$this.find(".capital-city-quiz-view-saved").hide();
		$this.find(".capital-city-quiz-configuration").hide();
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.failed_to_load_data_template.html());
		$this.find(".capital-city-quiz-retry").on("click", function() {
			$.capitalcityquiz.setup($this);
		});
	};
	
	$.g = $(".capital-city-quiz").each(function() {
		$.capitalcityquiz.setup($(this));
	});
});
