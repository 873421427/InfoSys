<template>
<div id="container-import">
  <div class="container-card">
    <div v-for="table in tables">
      <label>{{table.name}}</label>
      <input v-bind:id="table.id" type="file">
      <button class="button-import" v-bind:table-id="table.id" @click="importClick">上传</button>
      <hr>
    </div>
  </div>
</div>
</template>

<script>
import tableData from './javascripts/tableData.js'

export default {
  data: function() {
    return {
      tables: tableData
    }
  },
  methods: {
    //这里直接调用上面写好的函数，发送的json的table的值是给input的id
    importClick: function(event) {
      //console.log(event.currentTarget.getAttribute('table-id'))
      var tableId = event.currentTarget.getAttribute('table-id')
      this.importExcel($('#'+tableId).prop('files')[0], tableId, this.send)
    },
    //导入，第一个参数file，第二个参数id表示该input的id，callback是个send函数，讲文件内容读取完毕之后就send
    importExcel: function(file, id, callback) {
      if(file == undefined) {
        alert('请选择要上传的文件')
        return
      }
      var wb;//读取完成的数据
      var rABS = false; //是否将文件读取为二进制字符串
      const IMPORTFILE_MAXSIZE = 1*1024;//这里可以自定义控制导入文件大小
      var suffix = file.name.split(".")[1]
      if(suffix != 'xls' && suffix !='xlsx' && suffix != 'csv'){
        alert('导入的文件格式不正确!')
        return
      }
      if(file.size / 1024 > IMPORTFILE_MAXSIZE){
        alert('导入的表格文件不能大于1M')
        return
      }
      var f = file;
      var reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        if(rABS) {
          wb = XLSX.read(btoa(this.fixdata(data)), {//手动转化
              type: 'base64'
          });
        } else {
          wb = XLSX.read(data, {
              type: 'binary'
          });
        }
        //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
        //wb.Sheets[Sheet名]获取第一个Sheet的数据
        var str = JSON.stringify( XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
        //alert($(this).attr('id'));
        callback(id, str);
      };
      if(rABS) {
        reader.readAsArrayBuffer(f);
      } else {
        reader.readAsBinaryString(f);
      }
    },
    fixdata: function(data) { //文件流转BinaryString
      var o = "",
          l = 0,
          w = 10240;
      for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
      return o;
    },
    //send函数的实现
    send: function(id, str) {
      //console.log(str)
      var field = [];
      var batchInfo = [];
      var temp = str.split('}');
      var temp2 = [];//保存json数组
      for(var i=0;i<temp.length-1;i++)
      {
        temp2.push(temp[i].substr(1)+"}");
        temp2[i] = JSON.parse(temp2[i]);
      }
      //parse recordName to recordId
      var records = []
      for(let ite in tableData){
          if(id == ite){
            records = tableData[ite]['records']
            //console.log(tableData[ite]['records'])
            break
          }
      }
      for(let item in temp2[0]){
        for(let ite in records){
          if(item == records[ite].name) {
            field.push(ite)
          }
        }
      }
      for(var i=0; i<temp2.length; i++)
      {
        batchInfo.push([]);
        for(let item in temp2[i])
        {
          for(let ite in records){
            if(item == records[ite].name){
              batchInfo[i].push(temp2[i][item])
            }
          }
        }
      }
      var alldata = JSON.stringify({
        'table': id,
        'field': field,
        'batchInfo': batchInfo
      });
      //下面那条语句把从文件中读取的json显示到前端的demo中
      console.log(alldata)
      //上面是验证并生成json数据，下面是发送数据。暂时注释
      $.ajax({
        type: 'POST',
        url: '/students/import',
        data: alldata,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        timeout: 5000,
        success: function(result, xhr) {
          for(let key in result){
            if(key == 'content'){
              //操作成功
              alert('导入成功！')
            } else if (key == 'err'){
              //操作错误
              alert('导入错误: ' + result[key]['sqlMessage'])
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

<style>
#container-import .container-card {
  margin: 25px;
  padding: 2%;
  text-align: left;
  background-color: white;
  /*radius*/
  border-radius: 3px;
  /*shadow*/
  box-shadow: -1px 1px 5px var(--grey-shadow);
}

.button-import {
  margin-top: 10px;
  text-align: left;
}
</style>