jQuery(document).ready(function($) {
	$.capitalcityquiz = {};
	$.capitalcityquiz.data = {};
	$.capitalcityquiz.resources_url = "resources/";
	$.capitalcityquiz.number_of_questions = 5;
	
	$.capitalcityquiz.start_template = $("#capital-city-quiz-start-template");
	$.capitalcityquiz.enter_template = $("#capital-city-quiz-enter-template");
	$.capitalcityquiz.finished_template = $("#capital-city-quiz-finished-template");
	$.capitalcityquiz.saved_template = $("#capital-city-quiz-saved-template");
	$.capitalcityquiz.failed_to_load_data_template = $("#capital-city-quiz-failed-to-load-data-template");
	
	$.capitalcityquiz.setup = function($this) {
		$this = $($this);
		
		$this.html("<p class=\"pull-right\"><span class=\"capital-city-quiz-question-number\" style=\"margin: 7px 13px;\">Question 0/0</span><span class=\"capital-city-quiz-score\" style=\"margin: 7px 13px;\"><span class=\"capital-city-quiz-score-1\"></span> point<span class=\"capital-city-quiz-score-s\"></span></span><span class=\"btn-group\"><button class=\"btn btn-default capital-city-quiz-restart\" style=\"display: none;\">Restart</button><button class=\"btn btn-default capital-city-quiz-view-saved\" style=\"display: none;\">View saved</button></span></p><h3>Capital City Quiz</h3><div class=\"capital-city-quiz-messages\"></div><div class=\"capital-city-quiz-container\"><p class=\"alert alert-info\">Loading...</p></div>");
		
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
		
		$.capitalcityquiz.renderStartTemplate($this);
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
		var countries = Object.keys($.capitalcityquiz.data.names);
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
			storage = JSON.parse(window.localStorage.capitalcityquiz) || {};
		
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
			storage = JSON.parse(window.localStorage.capitalcityquiz) || {};
		
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
	
	$.capitalcityquiz.renderStartTemplate = function($this) {
		$this.attr("data-capitalcityquiz", "template-start");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").hide().on("click", function() {
			$.capitalcityquiz.setup($this);
		});
		$this.find(".capital-city-quiz-view-saved").show().on("click", function() {
			$.capitalcityquiz.showSaved($this);
		});
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.start_template.html());
		$this.find(".capital-city-quiz-start").on("click", function() {
			$.capitalcityquiz.showNextQuestion($this);
		});
	};
	
	$.capitalcityquiz.renderInputTemplate = function($this, question_number, country) {
		$this.attr("data-capitalcityquiz", "template-input").attr("data-capitalcityquiz-question-number", question_number).attr("data-capitalcityquiz-country", country.iso2);
		$this.find(".capital-city-quiz-question-number").show().text("Question " + (question_number + 1) + "/" + $.capitalcityquiz.getNumberOfQuestions($this));
		$this.find(".capital-city-quiz-score").show();
		$this.find(".capital-city-quiz-restart").show();
		$this.find(".capital-city-quiz-view-saved").hide();
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
		$this.find(".capital-city-quiz-restart").hide();
		$this.find(".capital-city-quiz-view-saved").hide();
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
	
	$.capitalcityquiz.renderFailedToLoadDataTemplate = function($this) {
		$this.attr("data-capitalcityquiz", "template-failed-to-load-data");
		$this.find(".capital-city-quiz-question-number").hide();
		$this.find(".capital-city-quiz-score").hide();
		$this.find(".capital-city-quiz-restart").hide();
		$this.find(".capital-city-quiz-view-saved").hide();
		$this.find(".capital-city-quiz-container").html($.capitalcityquiz.failed_to_load_data_template.html());
		$this.find(".capital-city-quiz-retry").on("click", function() {
			$.capitalcityquiz.start($this);
		});
	};
	
	$.g = $(".capital-city-quiz").each(function() {
		$.capitalcityquiz.setup($(this));
	});
});
