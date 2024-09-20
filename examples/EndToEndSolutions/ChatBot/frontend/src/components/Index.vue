<template>
  <div class="md-layout" style="height: 100%">
    <div class="md-layout-item md-size-20"></div>
    <div class="md-layout-item">
      <div class="chat-list" ref="chatList">
        <md-list>
          <md-list-item v-for="item in messages" :key="item.index">
            <md-avatar>
              <img v-if="item.type === 'user'" src="../assets/people.png" alt="Avatar">
              <img v-else-if="item.type === 'assistant'" src="../assets/tongyi.png" alt="Avatar">
            </md-avatar>
            <vue-markdown class="chat-content md-elevation-1" :source="item.content"></vue-markdown>
          </md-list-item>
        </md-list>
      </div>

      <div class="chat-input">
        <md-field>
          <md-textarea style="resize: none" placeholder="请输入您想问的问题" v-model="prompt" @keydown.enter="onSendClicked"></md-textarea>
          <md-button class="md-icon-button" v-on:click="onSendClicked">
            <md-icon>arrow_forward</md-icon>
          </md-button>
        </md-field>
      </div>

      <md-dialog :md-active.sync="settings.show">
        <md-dialog-title>对话配置</md-dialog-title>

        <md-dialog-content>
          <md-radio v-model="settings.type" value="app">应用</md-radio>
          <md-radio v-model="settings.type" value="model">模型</md-radio>
          <div v-if="settings.type === 'app'">
            <md-field>
              <label>应用ID</label>
              <md-input v-model="settings.app.appId"></md-input>
            </md-field>
          </div>
          <div v-else-if="settings.type ==='model'">
            <md-field>
              <label>模型ID</label>
              <md-input v-model="settings.model.modelId"></md-input>
            </md-field>
            <md-field>
              <label>系统人设，例如“你是一个导游”</label>
              <md-textarea v-model="settings.model.systemMessage"></md-textarea>
            </md-field>
          </div>
        </md-dialog-content>

        <md-dialog-actions>
          <md-button class="md-primary" @click="onSettingsCancel">取消</md-button>
          <md-button class="md-primary" @click="onSettingsSave">确定</md-button>
        </md-dialog-actions>
      </md-dialog>

      <md-snackbar :md-position="'center'" :md-duration="3000" :md-active.sync="snackbar.show" md-persistent>
        <span>{{snackbar.content}}</span>
      </md-snackbar>
    </div>
    <div class="md-layout-item md-size-20">
      <md-button class="md-icon-button" style="float: right; margin-right: 20px; margin-top: 20px" v-on:click="onSettingsClicked">
        <md-icon>settings</md-icon>
      </md-button>
    </div>
  </div>
</template>

<script>
  import {v4 as uuidv4} from "uuid";
  import {fetchEventSource} from "@microsoft/fetch-event-source";
  export default {
    name: "Index",
    data() {
      return {
        messages: [],
        generating: false,
        prompt: "",
        snackbar: {
          show: false,
          content: "",
        },
        settings: {
          show: false,
          type: "app",
          app: {
            appId: "",
            sessionId: "",
          },
          model: {
            modelId: "qwen-turbo",
            systemMessage: "",
            sessionId: uuidv4(),
          }
        },
        settingsCache: {},
      }
    },

    methods: {
      //自动跳转到最新对话
      scrollToBottom() {
        this.$nextTick(()=>{
          const chatList = this.$refs.chatList;
          chatList.scrollTop = chatList.scrollHeight;
        });
      },

      //发送按钮点击事件处理
      onSendClicked() {
        if(this.prompt.length === 0) {
          console.log("prompt is empty!");
          return;
        }

        if(this.generating === true) {
          console.log("assistant generating!");
          return;
        }

        this.messages.push({index: this.messages.length, type: "user", content: this.prompt});
        this.messages.push({index: this.messages.length, type: "assistant", content: ""});

        const self = this;
        const abortController = new AbortController()

        let url, body;
        if(this.settings.type === "app") {
          url = this.$protocol + "//" + this.$host + "/app/completions";
          body = JSON.stringify({
            prompt: this.prompt,
            appId: this.settings.app.appId,
            sessionId: this.settings.app.sessionId,
          });
        } else if(this.settings.type === "model") {
          url = this.$protocol + "//" + this.$host + "/model/generation";
          body = JSON.stringify({
            prompt: this.prompt,
            modelId: this.settings.model.modelId,
            systemMessage: this.settings.model.systemMessage,
            sessionId: this.settings.model.sessionId,
          });
        } else {
          return;
        }

        fetchEventSource(url, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
          signal: abortController.signal,
          onmessage(msg) {
            console.log(msg.data);
            let data = JSON.parse(msg.data);

            if(data["success"] === true) {
              self.messages[self.messages.length-1].content = data["data"]["text"];

              if(self.generating === false) {
                self.generating = true;
                self.prompt = "";
              }

              //流式生成结束
              if(data["data"]["finishReason"] === "stop") {
                self.generating = false;

                if(self.settings.type === "app") {
                  self.settings.app.sessionId = data["data"]["sessionId"];
                } else if(self.settings.type === "model") {
                }
              }
            } else {
              self.snackbar.content = data["errorMsg"];
              self.snackbar.show = true;
            }

            self.scrollToBottom();
          },
          onerror(error) {
            console.log(error);
          },
          onclose() {
            console.log("http sse close!");
          },
        });
      },

      onSettingsClicked() {
        if(this.generating === true) {
          console.log("assistant generating!");
          return;
        }
        this.settingsCache = JSON.parse(JSON.stringify(this.settings)); //缓存设置
        this.settings.show = true;
      },

      onSettingsSave() {
        this.messages = [];
        this.settings.app.sessionId = "";
        this.settings.model.sessionId = uuidv4();
        this.settings.show = false;
      },

      onSettingsCancel() {
        this.settings = JSON.parse(JSON.stringify(this.settingsCache)); //还原设置
        this.settings.show = false;
      },
    },
  }
</script>

<style scoped>
.md-layout-item{
  max-height: 100%;
}

.chat-list{
  min-height: 80%;
  max-height: 80%;
  overflow-y: auto
}

.chat-list::-webkit-scrollbar {
  display: none; /* 不显示滚动条 */
}

.chat-content{
  width: 100%;
  white-space: normal;
  padding: 10px 20px 10px 20px
}
</style>
