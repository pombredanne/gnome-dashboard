/* 
 * Copyright (C) 2012-2014 Bitergia
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *
 */

var Search = {};

(function() {

    var search_data = {};

    function getAllItemsData() {
        data = [];
        // Projects
        $.each(Report.getDataSources(), function(pos, ds) {
            projects = ds.getProjectsData();
            $.each(projects, function(pos1, project) {
                data.push(project);
            });
        });
        // Repos
        $.each(Report.getDataSources(), function(pos, ds) {
            repos = ds.getReposData();
            $.each(repos, function(pos1, repo) {
                data.push(repo);
            });
        });
        // Companies
        $.each(Report.getDataSources(), function(pos, ds) {
            companies = ds.getCompaniesData();
            $.each(companies, function(pos1, company) {
                data.push(company);
            });
        });
        // Domains and people deactivated in Eclipse
        if (false) {
            // Domains
            $.each(Report.getDataSources(), function(pos, ds) {
                domains = ds.getDomainsData();
                $.each(domains, function(pos1, domain) {
                    data.push(domain);
                });
            });
            // People
            identities = Report.getPeopleIdentities();
            $.each(identities, function(pos, object) {
                $.each(object.identity, function(pos1, value) {
                    data.push(DataProcess.hideEmail(value));
                });
            });
        }
        // We should remove duplicate elements
        // TODO: insert element and type in order to support the same item in two types
        var uniqueData = [];
        $.each(data, function(i, el){
            if($.inArray(el, uniqueData) === -1) uniqueData.push(el);
        });
        return uniqueData;
    }

    function selectedItem(item) {
        // Search items in all places and build URL according to it
        var found = false, place = null, id = null;

        // People
        identities = Report.getPeopleIdentities();
        $.each(identities, function(pos, object) {
            $.each(object.identity, function(pos1, value) {
                if (item === DataProcess.hideEmail(value)) {
                    found = true;
                    place = "people";
                    id = pos;
                    return false;
                }
            });
            if (found) {return false;}
        });

        $.each(Report.getDataSources(), function(pos, ds) {
            // Projects
            projects = ds.getProjectsData();
            $.each(projects, function(pos1, project) {
                if (item === project) {
                    found = true;
                    place = "project";
                    id = pos;
                    return false;
                }
            });
            // Repositories
            repos = ds.getReposData();
            $.each(repos, function(pos1, repo) {
                if (item === repo) {
                    found = true;
                    place = "repository";
                    id = pos;
                    return false;
                }
            });
            // Companies
            companies = ds.getCompaniesData();
            $.each(companies, function(pos1, company) {
                if (item === company) {
                    found = true;
                    place = "company";
                    id = pos;
                    return false;
                }
            });
            // Domains
            domains = ds.getDomainsData();
            $.each(domains, function(pos1, domain) {
                if (item === domain) {
                    found = true;
                    place = "domain";
                    id = pos;
                    return false;
                }
            });
            if (found) {return false;}
        });

        if (found) {
            if (place === "people") {
                var url = "people.html?id="+id;
                window.open(url,"_self");
            }
            else if (place === "project") {
                var url = "project.html?project="+item;
                window.open(url,"_self");
            }
            else if (place === "repository") {
                var url = "repository.html?repository="+item;
                window.open(url,"_self");
            }
            else if (place === "company") {
                var url = "company.html?company="+item;
                window.open(url,"_self");
            }
            else if (place === "domain") {
                var url = "domain.html?domain="+item;
                window.open(url,"_self");
            }
        }
        return item;
    }

    function substringMatcher(strs) {
        return function findMatches(q, cb) {
          var matches, substrRegex;

          // an array that will be populated with substring matches
          matches = [];

          // regex used to determine if a string contains the substring `q`
          substrRegex = new RegExp(q, 'i');

          // iterate through the pool of strings and for any string that
          // contains the substring `q`, add it to the `matches` array
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              // the typeahead jQuery plugin expects suggestions to a
              // JavaScript object, refer to typeahead docs for more info
              matches.push({ value: str });
            }
          });
          cb(matches);
        };
    }


    function displaySearch(div) {
        html += '<div class="form-group">';
        html =  '<form class="navbar-form navbar-right hidden-xs" role="search" style="margin-right: 25px;">';
        html += '<input type="text" class="typeahead form-control" placeholder="project, repositories, companies">';
        html += '</form>';
        html += '</div>';
        $("#"+div).html(html);

        data_source = getAllItemsData();

        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
          },
          {
            name: "Search",
            displayKey: 'value',
            source: substringMatcher(data_source)
          });
        $('.typeahead').bind('typeahead:selected', function(obj, datum, name) {
            selectedItem(datum.value);
        });
    }

    function waitNavBar () {
        // navmenu class should exists
        var divs = $(".navmenu");
        if (divs.length > 0) {
            Search.displaySearch();
        }
        else {
            setTimeout(waitNavBar, 500);
        }
    }

    function loadSearchDataOld (cb) {
        project = Report.getParameterByName("project");

        var sonar_json = "data/json/"+project+"-sonar-prj-static.json";
        var grimoirelib_json = "data/json/"+project+"-grimoirelib-prj-static.json";
        var pmi_json = "data/json/"+project+"-pmi-prj-static.json";

        $.when($.getJSON(sonar_json),$.getJSON(grimoirelib_json),$.getJSON(pmi_json)
            ).done(function(sonar, grimoirelib, pmi) {
                sonar_metrics = sonar[0];
                grimoirelib_metrics = grimoirelib[0];
                pmi_metrics = convert_boris_json(pmi[0]);
                // First approach
                metrics.product_metrics = sonar_metrics;
                metrics.process_metrics = grimoirelib_metrics;
                metrics.usage_metrics = pmi_metrics;
                cb();
        }).fail(function() {
            alert("Can't read Polarys JSON files. Review: " + 
                    sonar_json + " " + grimoirelib_json + " " + pmi_json);
        });
    }

    Search.displaySearch = function() {
        var mark = "Search";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                displaySearch(div.id);
            });
        }
    };


    Search.build = function() {
        waitNavBar();
    };
})();

Loader.data_ready(function() {
    Search.build();
});
