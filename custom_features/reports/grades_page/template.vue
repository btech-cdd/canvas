<template>
  <div class='btech-modal btech-canvas-report' style='display: inline-block;'>
    <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
    <div class='btech-modal-content'>
      <div class='btech-modal-content-inner'>
        <span class='btech-close' v-on:click='close()'>&times;</span>
        <h3 style='text-align: center;'>Report</h3>
        <h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>
        <h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that
          column.</h5>
        <div class='btech-report-columns-toggle'>
          <div class='btech-report-column-toggle' style='display: inline-block;' v-for='column in columns'
            :key='column.name'>
            <div v-if="column.hideable">
              <input type="checkbox" v-model="column.visible"><label>{{column.name}}</label>
            </div>
          </div>
        </div>
        <div>
          <div
            style="
              display: grid;
              grid-template-columns: 12rem 10rem 5rem 5rem 10rem 7rem 5rem
              font-size: 0.75rem;
            "
          >
            <div 
              v-for='column in visibleColumns' 
              style="display: inline-block;"
              :key='column.name' 
            >
              <span><b>{{column.name}}</b></span>
            </div>
          </div>
          <div 
            style="
              display: grid;
              grid-template-columns: 12rem 10rem 4rem 4rem 10rem 7rem 5rem;
              font-size: 0.75rem;
            "
            v-for='student in students' 
            :key='student.user_id'
          >
            <!--Name-->
            <div 
              style="display: inline-block;;"
            >
              {{student.name }}
            </div>
            <div 
              style="display: inline-block;"
            >
              {{student.section}}
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': (student.grade_to_date < 60) ? colors.red : (student.grade_to_date < 80 ? colors.yellow : colors.green),
                  'color': colors.white,
                }">
                {{student.grade_to_date}}%
              </span>
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': (student.final_grade < 60) ? colors.red : (student.final_grade < 80 ? colors.yellow : colors.green),
                  'color': colors.white,
                }">
                {{student.final_grade }}%
              </span>
            </div>
            <div 
              style="display: inline-block"
            >
              <course-progress-bar-ind
                :progress="student.points"
                :barwidth="9"
                :colors="colors"
              ></course-progress-bar-ind>
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': (student.days_since_last_submission >= 10) ? colors.red : (student.days_since_last_submission >= 7 ? colors.yellow : colors.green),
                  'color': colors.white,
                }">
                {{student.days_since_last_submission}} days
              </span>
            </div>
            <div 
              style="display: inline-block;"
            >
              <span 
                class="btech-pill-text" 
                :style="{
                  'background-color': colors.gray,
                  'color': colors.black,
                }">
                {{student.days_in_course}} days
              </span>
            </div>
          </div>
        </div>

        <table class='btech-report-table' border='1'>
          <thead border='1'>
            <tr>
              <th v-for='column in visibleColumns' :key='column.name' :class='column.sortable_type'
                @click="sortColumn(column.name)">{{column.name}}</th>
            </tr>
          </thead>
          <tbody border='1'>
            <tr v-if="loading">
              <td :colspan='visibleColumns.length'>Loading Results...</td>
            </tr>
            <tr v-for='student in students' :key='student.user_id'>
              <td v-for='column in visibleColumns' :key='column.name'
                v-bind:style="{'background-color': getBackgroundColor(column.name, student[column.name.toLowerCase().replace(/ /g, '_')])}">
                <span v-html="getColumnText(column, student)"></span>
              </td>
            </tr>
          </tbody>
          <tfoot border='1'>

          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>