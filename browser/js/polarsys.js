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

var Polarsys = {};

(function() {

    var sonar_metrics = null;
    var grimoirelib_metrics = null;
    var pmi_metrics = null;
    var metrics = {"process_metrics": {},
                   "product_metrics":{},
                   "community_metrics":{},
                   "usage_metrics":{}
                    };
    // Map the metrics names to grimoire lib metrics names
    var metrics_to_grimoirelib = {
            "scm_commits_1m":"scm_commits",
            "scm_committers_1m":"scm_authors",
            "scm_committed_files_1m":"scm_files"
    };

    function displayVizEvol(metric) {
        // Display evolution in time of a metric using the min viz.
        metric = metrics_to_grimoirelib[metric];
        html = '';
        html += ' \
            <div class="FilterItemMetricsEvol" data-data-source="scm" \
            data-metrics="'+metric+'" data-min="true" data-frame-time="true" \
            data-legend1="true" data-filter="projects" style="height: 100px;"> \
            </div> \
        ';
        return html;
    }

    // Quick hack to show metrics with some design inside Bootstrap
    function displayMetric(name, description, value) {
        metric = metrics_to_grimoirelib[name];
        if (Report.getAllMetrics()[metric] !== undefined)
            description = Report.getAllMetrics()[metric].desc;
        // Temporal hack
        description = description.replace("aggregating all branches","");
        html = ' \
              <div class="well"> \
                <div class="row thin-border"> \
                  <div class="col-md-12">' + name + '</div> \
                </div> \
                <div class="row grey-border"> \
                  <div class="col-md-12 medium-fp-number">'+value+'</span> \
                  </div> \
                </div> \
               <div style="height: 120px; font-size: 70%;">'+displayVizEvol(name)+'</div> \
               <div style="font-size: 80%;">'+description+'</div> \
              </div> \
        ';
        return html;
    }

    function displayPolarsysMetrics(div) {
        html = "";
        $.each(metrics, function(id, mgroup){
            if (mgroup === null) return;
            html += '<div class="col-md-3">';
            html += "<h2>"+id+"</h2>";
            $.each(mgroup, function(metric, value){
                html += displayMetric(metric,"",value);
            });
            html += '</div>';
        });
        $("#"+div).html(html);
        // We need to convert the viz
        item = Report.getParameterByName("project");
        Convert.convertFilterItemMetricsEvol("projects", item);

        return;
    }

    function convert_boris_json(data) {
        var new_data = {};
        if (data.children === undefined) return new_data;
        $.each (data.children, function(i, metric) {
            new_data[metric.name] = metric.value;
        });
        return new_data;
    }

    function loadPolarsysMetrics (cb) {
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

    Polarsys.displayPolarsysMetrics = function() {
        var mark = "PolarsysMetrics";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                displayPolarsysMetrics(div.id);
            });
        }
    };


    Polarsys.build = function() {
        loadPolarsysMetrics(Polarsys.displayPolarsysMetrics);
    };
})();

Loader.data_ready(function() {
    Polarsys.build();
});
