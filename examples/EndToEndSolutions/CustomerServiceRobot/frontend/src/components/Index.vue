<template>
  <div class="md-layout" style="height: 100%">
    <div class="md-layout-item md-size-20"></div>
    <div class="md-layout-item">
      <div v-if="guideShow===true" class="guide" style="text-align: center">
        <img src="../assets/tongyi.png" alt="tongyi" style="width: 48px; padding-top: 160px; padding-bottom: 20px;">
        <div style="font-size: 28px; color: #26244c; font-weight: 600; line-height: 40px">你好，我是AI客服</div>
      </div>

      <div v-else class="chat-list" ref="chatList">
        <md-list>
          <md-list-item v-for="item in messages" :key="item.index">
            <md-avatar>
              <img v-if="item.role === 'user'" src="../assets/people.png" alt="Avatar">
              <img v-else-if="item.role === 'assistant'" src="../assets/tongyi.png" alt="Avatar">
            </md-avatar>
            <vue-markdown class="chat-content md-elevation-1" :source="item.content"></vue-markdown>
          </md-list-item>
        </md-list>
      </div>

      <div class="chat-input">
        <md-field>
          <md-textarea style="resize: none" placeholder="请输入您想问的问题" v-model="prompt" @keydown.enter="onInputClicked"></md-textarea>
          <md-button class="md-icon-button" v-on:click="onInputClicked">
            <md-icon>arrow_forward</md-icon>
          </md-button>
        </md-field>
      </div>

      <md-dialog :md-active.sync="summary.show">
        <md-dialog-title style="text-align: center">对话内容概要</md-dialog-title>

        <md-dialog-content>
          <vue-markdown class="chat-content" :source="summary.content"></vue-markdown>
        </md-dialog-content>
      </md-dialog>

      <md-snackbar :md-position="'center'" :md-duration="3000" :md-active.sync="snackbar.show" md-persistent>
        <span>{{snackbar.content}}</span>
      </md-snackbar>
    </div>
    <div class="md-layout-item md-size-20">
      <md-button class="md-icon-button" style="float: right; margin-right: 20px; margin-top: 20px" v-on:click="onSummaryClicked">
        <md-icon>info</md-icon>
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
        guideShow: true,
        messages: [],

        userName: "张三",
        userId: "user_111113",
        userGender: "男",

        prompt: "",
        sessionId: uuidv4(),
        generating: false,

        summary: {
          show: false,
          content: "",
        },

        snackbar: {
          show: false,
          content: "",
        },
      }
    },
    methods: {
      scrollToBottom() {
        this.$nextTick(()=>{
          const chatList = this.$refs.chatList;
          chatList.scrollTop = chatList.scrollHeight;
        });
      },

      postMessage(message) {
        const self = this;
        const abortController = new AbortController()
        const url = this.$protocol + "//" + this.$host + "/chatbot/ask";

        fetchEventSource(url, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: this.userName,
            userId: this.userId,
            userGender: this.userGender,
            sessionId: this.sessionId,
            message: message,
          }),
          signal: abortController.signal,
          onmessage(msg) {
            console.log(msg.data);
            let data = JSON.parse(msg.data);

            if(data["success"] === true) {
              if(self.generating === false) {
                self.generating = true;
                self.prompt = "";
              }

              if(self.messages[self.messages.length-1].role === "assistant") {
                self.messages[self.messages.length-1].content = data["data"]["message"]["content"];
              }

              if(data["data"]["finish"] === true) {
                self.generating = false;
              }

              if("tool_calls" in data["data"]["message"]) {
                self.postMessage({})
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

      onInputClicked() {
        if(this.prompt.length === 0) {
          this.snackbar.content = "输入为空！";
          this.snackbar.show = true;
          return;
        }

        if(this.generating === true) {
          this.snackbar.content = "模型生成中...";
          this.snackbar.show = true;
          return;
        }

        this.guideShow = false;
        this.messages.push({index: this.messages.length, role: "user", content: this.prompt});
        this.messages.push({index: this.messages.length, role: "assistant", content: "思考中，请稍等..."});

        this.postMessage({role: "user", content: this.prompt})
      },

      onSummaryClicked() {
        if(this.guideShow === true) {
          this.snackbar.content = "对话内容为空，无法总结概要！";
          this.snackbar.show = true;
          return;
        }

        if(this.generating === true) {
          this.snackbar.content = "模型生成中...";
          this.snackbar.show = true;
          return;
        }

        this.summary.content = "";
        this.summary.show = true;
        const self = this;
        const abortController = new AbortController()
        const url = this.$protocol + "//" + this.$host + "/chatbot/summary";
        fetchEventSource(url, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
          }),
          signal: abortController.signal,
          onmessage(msg) {
            console.log(msg.data);
            let data = JSON.parse(msg.data);
            if(data["success"] === true) {
              self.summary.content = data["data"]["message"]["content"];
            }
          },
          onerror(error) {
            console.log(error);
          },
          onclose() {
            console.log("http sse close!");
          },
        });
      },
    },
  }
</script>

<style scoped>
.md-layout-item{
  max-height: 100%;
}

.chat-list, .guide{
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
