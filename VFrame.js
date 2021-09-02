import vMain from "./configs/main"
import vParams from "./configs/params"
import AuthUser from "./models/AuthUser"

export default class VFrame {
    static _instance

    mainConfig = {}

    params = {}

    dictList = {}

    permissionList = []

    user = undefined

    toast = {
        id: undefined,
        message: '',
        type: 'info',
        duration: 3000,
        showClose: true,
    }

    dialog = {
        id: undefined,
        title: undefined,
        message: undefined,
        type: 'info',
        showClose: true,
        showCancel: true,
        showConfirm: true,
        cancelText: '取消',
        confirmText: '确定',
        callback: undefined
    }

    notify = {
        id: undefined,
        title: undefined,
        message: undefined,
        type: 'info',
        duration: 5000,
        showClose: true,
        callback: undefined
    }

    modal = {
        id: undefined,
        callback: undefined,
        showClose: true,
        title: undefined,
        content: undefined
    }

    loading = 0

    /**
     * 添加loading状态
     */
    showLoading() {
        this.loading++
    }

    /**
     * 移除loading状态
     */
    hideLoading() {
        this.loading -= 1
        this.loading = this.loading < 0 ? 0 : this.loading
    }

    /**
     * 展示模态框
     * @param {object<title, component, showClose, callback>} options
     */
    showModal(options) {
        this.modal = Object.assign({
            id: Math.random(),
            callback: undefined,
            showClose: true,
            title: undefined,
            component: undefined
        }, options)
    }

    /**
     * 关闭模态框
     * @param {boolean} runCallback 是否要执行callback函数（如果有）
     */
    hideModal(runCallback = false) {
        if (runCallback && typeof this.modal.callback === 'function') {
            return this.modal.callback(() => {
                this.hideModal(false)
            })
        }
        this.modal = Object.assign({}, this.modal, {
            id: undefined,
            callback: undefined,
            showClose: true,
            title: undefined,
            component: undefined
        })
    }
    /**
     * 展示通知框
     * @param {object<title, message, type, duration, showClose, callback>} options
     */
    showNotify(options) {
        this.notify = Object.assign({
            id: Math.random(),
            title: undefined,
            message: undefined,
            type: 'info',
            duration: 5000,
            showClose: true,
            callback: undefined
        }, options)
    }

    /**
     * 展示轻提示框
     * @param {object<message, type, duration, showClose>} options
     */
    showToast(options) {
        this.toast = Object.assign({
            id: Math.random(),
            message: '',
            type: 'info',
            duration: 3000,
            showClose: true,
        }, options)
    }

    /**
     * 展示对话框
     * @param {object<title, message, type, showClose, showCancel, showConfirm, cancelText, confirmText, callback>} options
     */
    showDialog(options) {
        this.dialog = Object.assign({
            id: Math.random(),
            title: undefined,
            message: undefined,
            type: 'info',
            showClose: true,
            showCancel: true,
            showConfirm: true,
            cancelText: '取消',
            confirmText: '确定',
            callback: undefined
        }, options)
    }

    /**
     * 获取一个错误实例
     * @param {string} name
     * @param {string} message
     * @returns {Error}
     */
    getError(name, message) {
        let error = new Error();
        error.name = name
        error.message = message
        return error
    }

    /**
     * 设置主配置
     * @param {object} mainConfig
     * @return {VFrame}
     */
    setMainConfig(mainConfig) {
        this.mainConfig = Object.assign(vMain, mainConfig)
        return this
    }

    /**
     * 设置全局变量
     * @param {object} params
     * @return {VFrame}
     */
    setParams(params) {
        this.params = Object.assign(vParams, params)
        return this
    }

    /**
     * 在 params 中增加一个数据
     * @param {string} name
     * @param data
     */
    setParam(name, data) {
        this.params[name] = data
    }

    /**
     * 获取是否有权限
     * @param {string} name 权限名
     * @returns {boolean}
     */
    getHasPermission(name) {
        return name === undefined || this.permissionList.indexOf(name) !== -1
    }

    /**
     * 设置用户实例
     * @param {AuthUser} user
     */
    setUser(user) {
        if( user instanceof AuthUser ) {
            this.user = user
        } else {
            throw this.getError("设置用户实例错误", "请设置一个AuthUser的子类实例")
        }
    }

    /**
     * 设置权限列表
     * 该方法会覆盖现有的所有权限
     * @param {array<string>} list
     */
    setPermissionList(list) {
        this.permissionList = list
    }

    /**
     * 设置数据词典列表
     * 该方法会覆盖现有所有的词典列表
     * @param {object<array<object<name, value>>>} list
     */
    setDictList(list) {
        this.dictList = list
    }

    /**
     * 获取实例
     * @returns {VFrame}
     */
    static getInstance() {
        this._instance = this._instance || new this()
        return this._instance
    }

    async install() {
        await import('./styles/helper.css')
        this.constructor._instance = this
        let config = (await import('@/configs/main')).default
        let user = new config.user.class()
        user.setSources(config.user.params || {})
        this.setUser(user)
        let params = (await import('@/configs/params')).default
        this.setParams(params)
        this.setMainConfig(config)
        return this
    }

    async installForVue(app, reactive) {
        await this.install()
        app.config.globalProperties.$vf = reactive(this)
        this.constructor._instance = app.config.globalProperties.$vf
    }
}