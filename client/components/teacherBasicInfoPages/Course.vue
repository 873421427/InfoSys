<template>
  <div>
    <!--顶部菜单-->
    <div class="container-header">
      <p class="header-text">课程成绩管理</p>
      <div class="header-button">
        <!--<span @click="insertClick">插入数据</span>-->
        <span @click="downloadClick">导出</span>
        <span @click="importClick">导入<input id="button-import" v-on:change="importUpload" type="file"></span>
        <span @click="mubanDownload">下载模板</span>
        <span>转毕业生</span>
        <span @click="diycolClick">自定义列</span>
        <span @click="sendEmailClick">邮件通知</span>
      </div>
    </div>
    <!--查询输入-->
    <div class="container-card-list">
      <div class="container-record" v-for="record in table.records">
        <span>{{record.name}}:</span>
        <input type="text" class="hide-container" v-if="record.valueType=='input'" v-bind:id="'course-'+record.id">
        <select class="hide-container" v-if="record.valueType=='select'" v-bind:id="'course-'+record.id">
          <option></option>
          <option v-for="option in record.options">{{option}}</option>
        </select>
        <span class="hide-container" v-if="record.valueType=='range'" v-bind:id="'course-'+record.id">
        <span class="text-range">最小值 </span>
        <input type="text" class="min"><span class="text-range">最大值 </span>
        <input type="text" class="max">
        </span>
      </div>
      <button class="manager-button" @click="queryClick">查询</button>
    </div>
    <!--显示数据-->
    <div class="container-card-list">
      <table border="1">
        <tr class="table-head">
          <th>#</th>
          <th v-for="record in table.records" v-if="record['display']==true">{{record.name}}</th>
        </tr>
        <tr v-for="(student, index) in students" @click="studentClick" v-bind:sid="student['course']['sid']">
          <td>{{index+1}}</td>
          <td v-for="record in table.records" v-if="record['display']==true" contenteditable="false">
            <span v-if="student['course'][record.id]!=undefined">{{student['course'][record.id]}}</span>
            <span v-else>---</span>
          </td>
        </tr>
      </table>
    </div>
    <!--统计-->
    <div class="container-card-list">
      <div class="stat-record" v-for="record in table.records">
        <button class="stat-checkbox" v-bind:record-id="record.id" @click="statButtonToggle">{{record.name}}</button>
        <select class="hide-container" v-if="record.valueType=='select'" v-bind:id="'course-stat-'+record.id">
          <option></option>
          <option v-for="option in record.options">{{option}}</option>
        </select>
        <input class="hide-container" type="text" v-else v-bind:id="'course-stat-'+record.id">
        <span class="stat-nonselect-range" v-bind:id="'course-stat-range-'+record.id" v-if="record.id=='GPA'">
          <div>
            统计起点: <input id="stat-nonselect-input-GPA-start">
          </div>
          <div>
            统计终点: <input id="stat-nonselect-input-GPA-end">
          </div>
          <div>
            统计区间宽度:
            <select id="stat-nonselect-input-GPA-range">
              <option>0.1</option>
              <option>0.5</option>
              <option>1.0</option>
            </select>
          </div>
        </span>
      </div>
      <button class="manager-button" @click="statClick">统计</button>
      <span id="stat-chart-bar"></span>
      <span id="stat-chart-pie"></span>
    </div>
    <!-- 弹窗 -->
    <div id="popup" class="popup-background">
      <!-- 弹窗内容 -->
      <div class="popup-content">
        <span id="popup-close" @click="modalCloseClick">&times;</span>
        <div class="popup-cell" v-for="record in table.records">
          {{record.name}}
          <input type="checkbox" v-model:checked="record.display">
        </div>
      </div>
    </div>
    <!-- 发邮件 -->
    <div id="popup-email" class="popup-background">
      <email :emailSid="emailSid"></email>
    </div>
  </div>
</template>
<script>
import tableData from '../javascripts/tableData.js'
import formatCheck from '../javascripts/formatCheck.js'
import downloadModule from '../javascripts/downloadModule.js'
import importModule from '../javascripts/importModule.js'
import statModule from '../javascripts/statisticModule.js'
var empty = JSON.stringify({ equal: {}, range: {}, fuzzy: {} })
var emptyCell = JSON.stringify({})

export default {
  data: function() {
    return {
      table: tableData['course'],
      students: [],
      emailSid: []
    }
  },
  created: function() {
    //alert(window.innerWidth)
    //1536*728
  },
  methods: {
    insertClick: function() {
      this.$router.push({
        name: 'courseInsert'
      })
    },
    queryClick: function() {
      var course = { equal: {}, range: {}, fuzzy: {} }
      var data = {
        select: ['course'],
        where: {
          equal: {},
          range: {},
          fuzzy: {}
        }
      }
      if ($('#course-sid').val()) {
        var sid = $('#course-sid').val()
        if (!formatCheck['course']['sid']['reg'].test(sid)) {
          alert(formatCheck['course']['sid']['msg'])
          return
        } else {
          course['equal']['sid'] = sid
        }
      } else {
        //验证格式
        var message = ''
        for (let item in formatCheck['course']) {
          if (formatCheck['course'][item]['reg'] != null) {
            let record = $('#course-' + item).val()
            if (record != '' && !formatCheck['course'][item]['reg'].test(record)) {
              message = message + formatCheck['course'][item]['msg']
            }
          }
        }
        if (message != '') {
          alert(message)
          return
        }
        if ($('#course-name').val()) course['equal']['name'] = $('#course-name').val()
        //range value
        var rangeVal = { min: $('#course-year .min').val(), max: $('#course-year .max').val() }
        if (rangeVal['min'] != '' && rangeVal['max'] != '') {
          course['range']['year'] = rangeVal
        }
        //range value
        rangeVal = { min: $('#course-semester .min').val(), max: $('#course-semester .max').val() }
        if (rangeVal['min'] != '' && rangeVal['max'] != '') {
          course['range']['semester'] = rangeVal
        }
        if ($('#course-courseName').val()) course['equal']['courseName'] = $('#cschoolRoll-ourseName').val()
        if ($('#course-courseId').val()) course['equal']['courseId'] = $('#course-courseId').val()
        if ($('#course-courseClass').val()) course['equal']['courseClass'] = $('#course-courseClass').val()
        if ($('#course-courseProperty').val()) course['equal']['courseProperty'] = $('#course-courseProperty').val()
        if ($('#course-courseHour').val()) course['equal']['courseHour'] = $('#course-courseHour').val()
        if ($('#course-credit').val()) course['equal']['credit'] = $('#course-credit').val()
        //range value
        rangeVal = { min: $('#course-courseGrade .min').val(), max: $('#course-courseGrade .max').val() }
        if (rangeVal['min'] != '' && rangeVal['max'] != '') {
          course['range']['courseGrade'] = rangeVal
        }
        //range value
        rangeVal = { min: $('#course-GPA .min').val(), max: $('#course-GPA .max').val() }
        if (rangeVal['min'] != '' && rangeVal['max'] != '') {
          course['range']['GPA'] = rangeVal
        }
        if ($('#course-isPass').val()) course['equal']['isPass'] = $('#course-isPass').val()
        if ($('#course-rebuild').val()) course['equal']['rebuild'] = $('#course-rebuild').val()
        if ($('#course-backup').val()) course['equal']['backup'] = $('#course-backup').val()
      }
      if (JSON.stringify(course['equal']) != emptyCell) data['where']['equal']['course'] = course['equal']
      if (JSON.stringify(course['range']) != emptyCell) data['where']['range']['course'] = course['range']
      if (JSON.stringify(course['fuzzy']) != emptyCell) data['where']['fuzzy']['course'] = course['fuzzy']
      var postData = JSON.stringify(data)
      console.log(postData)
      //post
      var _self = this
      // replace getPost with your data fetching util / API wrapper
      $.ajax({
        type: 'POST',
        url: '/students/query',
        data: postData,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        timeout: 5000,
        success: function(result, xhr) {
          for (let key in result) {
            if (key == 'content') {
              //操作成功
              _self.students = result['content']
            } else if (key == 'err') {
              //操作错误
              alert('查询信息错误: ' + result[key]['sqlMessage'])
            }
          }
        },
        error: function(result, xhr) {
          //连接错误
          //console.log(result)
          alert('服务器连接错误: ' + xhr)
        }
      })
    },
    downloadClick: function() {
      downloadModule.downloadClick(this.students)
    },
    importClick: function() {
      $('#button-import').click()
    },
    mubanDownload: function() {
      downloadModule.mubanDownload("course")
    },
    //onchange时调用这个函数实现文件选择后上传
    importUpload: function() {
      importModule.importClick($('#button-import').prop('files')[0], 'course')
    },
    diycolClick: function() {
      $('#popup').show()
    },
    modalCloseClick: function() {
      $('#popup').hide()
    },
    //发送邮件函数
    sendEmailClick: function() {
      $('#popup-email').show()
      //加载收件人学号
      this.emailSid = []
      for (let i = 0; i < this.students.length; i++) {
        if(this.emailSid.indexOf(this.students[i]['course']['sid']) == -1)
          this.emailSid.push(this.students[i]['course']['sid'])
      }
    },
    studentClick: function(event) {
      //alert('您点击的学生学号是：' +  event.currentTarget.getAttribute('sid'))
      //跳转,在跳转完成后再请求数据,使用query在url内传参，这样不会有刷新就丢失的问题
      var routeData = this.$router.resolve({
        name: 'detail',
        query: {
          sid: event.currentTarget.getAttribute('sid')
        }
      })
      window.open(routeData.href, '_blank')
    },
    //统计
    statButtonToggle: function(event) {
      if (event.currentTarget.className == 'stat-checkbox') {
        event.currentTarget.className = 'stat-checkbox-selected'
        $('#course-stat-range-' + event.currentTarget.getAttribute('record-id')).css('display', 'block')
      } else if (event.currentTarget.className == 'stat-checkbox-selected') {
        event.currentTarget.className = 'stat-checkbox'
        $('#course-stat-range-' + event.currentTarget.getAttribute('record-id')).hide()
      }
    },
    statClick: function() {
      var data = {
        table: 'course',
        fields: [],
        condition: {}
      }
      $('.stat-checkbox-selected').each(function() {
        var recordId = $(this).attr('record-id')
        //绩点高级查询
        if (recordId == 'GPA') {
          var start = $('#stat-nonselect-input-GPA-start').val()
          var end = $('#stat-nonselect-input-GPA-end').val()
          var range = parseFloat($('#stat-nonselect-input-GPA-range').val()) * 100
          if (start != '' && end != '') {
            if (start < 0 || start > 5 || end < 0 || end > 5 || start >= end) {
              alert('请正确填写统计绩点的范围！')
              return
            }
            data['intervalFields'] = {}
            data['intervalFields']['GPA'] = [parseFloat(start)]
            for (let i = 0; i < 500; i += range) {
              if (i > start * 100 && i < end * 100) {
                data['intervalFields']['GPA'].push(i / 100)
              }
            }
            data['intervalFields']['GPA'].push(parseFloat(end))
          } else {
            data['fields'].push(recordId)

            //绩点作为筛选条件
            if ($('#course-stat-' + recordId).val() != '') {
              data['condition'][recordId] = $('#course-stat-' + recordId).val()
            }
          }
        } else {
          //除绩点外字段
          data['fields'].push(recordId)
          if ($('#course-stat-' + recordId).val() != '') {
            data['condition'][recordId] = $('#course-stat-' + recordId).val()
          }
        }
      })
      if (data['fields'].length == 0 && data['intervalFields'] == undefined) {
        alert('请选择想要统计的字段！')
        return
      }
      var postData = JSON.stringify(data)
      console.log(postData)
      $.ajax({
        type: 'POST',
        url: '/students/statistic',
        data: postData,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        timeout: 5000,
        success: function(result, xhr) {
          for (let key in result) {
            if (key == 'content') {
              //操作成功，配置图表
              /*let statData = [
                {gender: '女', major: null, statistic: 2},
                {gender: '女', major: 123, statistic: 1},
                {gender: '男', major: 123, statistic: 3},
                {gender: '男', major: '数学', statistic: 1}
              ]*/
              console.log(result[key])
              statModule.createCharts('course', result[key], 'stat-chart-bar', 'stat-chart-pie')
            } else if (key == 'err') {
              //操作错误
              alert('统计错误: ' + result[key]['sqlMessage'])
            }
          }
        },
        error: function(result, xhr) {
          //连接错误
          //console.log(result)
          alert('服务器连接错误: ' + xhr)
        }
      })
    }
  }
}
</script>
<style scoped>
.container-header {
  height: 70px;
  line-height: 70px;
  padding-left: 30px;
  text-align: left;
  background-color: white;
  /*shadow*/
  box-shadow: -1px 1px 5px var(--grey-shadow);
  /*设置文字不可被选中*/
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.header-text {
  float: left;
  font-size: 20px;
}

.header-button {
  float: right;
  margin-right: 20px;
}

.header-button span {
  padding-right: 10px;
  font-weight: bold;
  transition: 0.3s;
  -moz-transition: 0.3s;
  /* Firefox 4 */
  -webkit-transition: 0.3s;
  /* Safari 和 Chrome */
  -o-transition: 0.3s;
  /* Opera */
}

.header-button span:hover {
  color: var(--blue);
  cursor: pointer;
}

.container-record {
  float: left;
  width: 360px;
  height: 35px;
  text-align: right;
}

.container-record .text-range {
  font-size: 12px;
}

.container-record .min,
.container-record .max {
  width: 50px;
}

.container-record .hide-container {
  height: 24px;
  width: 180px;
}

.manager-button {
  float: left;
  clear: both;
  width: 110px;
  height: 36px;
  margin-left: calc(50% - 55px);
  font-size: 17px;
  color: white;
  background-color: var(--blue);
  border: none;
  transition: 0.3s;
  -moz-transition: 0.3s;
  /* Firefox 4 */
  -webkit-transition: 0.3s;
  /* Safari 和 Chrome */
  -o-transition: 0.3s;
  /* Opera */
}

.manager-button:hover {
  background-color: var(--blue-hover);
}

.container-card-list {
  margin: 25px;
  text-align: left;
  padding: 20px;
  /*alert($('.container-card-list').width())不包含margin，但是会减去padding
  固定了width，才能在内部元素超出宽度时出现滚动条*/
  /*width: 1251.32px;*/
  width: calc(100vw - 275px);
  background-color: white;
  /*radius*/
  border-radius: 3px;
  /*shadow*/
  box-shadow: -1px 1px 5px var(--grey-shadow);
  overflow: auto;
}

.container-card-list table {
  /*不会自动换行*/
  word-break: keep-all;
  white-space: nowrap;
  min-width: 100%;
  font-size: 14px;
  border-color: var(--grey-shadow);
}

.container-card-list th,
td {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.container-card-list tr {
  transition: background 0.3s;
  -moz-transition: background 0.3s;
  /* Firefox 4 */
  -webkit-transition: background 0.3s;
  /* Safari 和 Chrome */
  -o-transition: background 0.3s;
  /* Opera */
}

.container-card-list tr:not(.table-head):hover {
  background-color: var(--grey-hover);
}

#button-import {
  display: none;
}


/* 弹窗 (background) */

.popup-background {
  display: none;
  /* 默认隐藏 */
  position: fixed;
  /* 定位 */
  z-index: 10;
  /* 设置在顶层 */
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding-left: 225px;
  padding-top: 60px;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}


/* 弹窗内容 */

.popup-content {
  background-color: white;
  margin-top: 100px;
  margin-left: calc(50% - 200px);
  padding: 30px;
  width: 600px;
  height: 400px;
  /*radius*/
  border-radius: 3px;
  /*shadow*/
  box-shadow: -1px 1px 5px var(--grey-shadow);
}

.popup-cell {
  float: left;
  width: 160px;
  height: 40px;
  text-align: left;
}

/* 关闭按钮 */

#popup-close {
  position: relative;
  float: right;
  width: 50px;
  height: 50px;
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  text-align: right;
}

#popup-close:hover,
#popup-close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

/*统计*/

.stat-record {
  float: left;
  width: 300px;
  min-height: 35px;
  text-align: right;
  font-size: 13px;
}

.stat-record .hide-container {
  height: 23px;
  width: 140px;
}

/*
.stat-record input[type="checkbox"] {
  width: 13px;
  height: 13px;
}
*/

.stat-checkbox {
  width: 130px;
  height: 25px;
  border: none;
  background-color: var(--grey-hover);
  outline: none;
  transition: 0.3s;
  -moz-transition: 0.3s;
  /* Firefox 4 */
  -webkit-transition: 0.3s;
  /* Safari 和 Chrome */
  -o-transition: 0.3s;
  /* Opera */
}

.stat-checkbox:hover {
  transform: translate(0, -2px);
  box-shadow: 0 2px 2px var(--grey-shadow);
}

.stat-checkbox-selected {
  width: 130px;
  height: 25px;
  border: none;
  color: white;
  background-color: var(--blue);
  transform: translate(0, -2px);
  box-shadow: 0 2px 2px var(--grey-shadow);
  transition: 0.3s;
  -moz-transition: 0.3s;
  /* Firefox 4 */
  -webkit-transition: 0.3s;
  /* Safari 和 Chrome */
  -o-transition: 0.3s;
  /* Opera */
}

.stat-input {
  width: 10px;
  height: 10px;
}

.stat-nonselect-range {
  display: none;
}

.stat-nonselect-range div {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

#stat-nonselect-input-GPA-start,
#stat-nonselect-input-GPA-end {
  margin-left: 10px;
  display: inline-block;
  width: 140px;
}

#stat-nonselect-input-GPA-range {
  margin-left: 10px;
  width: 140px;
  height: 22px;
}

#stat-chart-bar {
  float: left;
  margin-top: 20px;
  width: 50%;
}

#stat-chart-pie {
  float: left;
  margin-top: 20px;
  width: 50%;
}
</style>