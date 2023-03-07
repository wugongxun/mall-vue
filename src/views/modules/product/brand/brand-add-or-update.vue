<template>
    <el-dialog
        :title="!dataForm.brandId ? '新增' : '修改'"
        :close-on-click-modal="false"
        :visible.sync="visible">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
                 label-width="120px">
            <el-form-item label="品牌名" prop="name">
                <el-input v-model="dataForm.name" placeholder="品牌名"></el-input>
            </el-form-item>
            <el-form-item label="品牌logo地址" prop="logo">
                <el-upload
                    class="avatar-uploader"
                    action="https://mall-wgx.oss-cn-nanjing.aliyuncs.com"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                    :data="signature">
                    <img v-if="dataForm.logo" :src="dataForm.logo" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
            </el-form-item>
            <el-form-item label="介绍" prop="descript">
                <el-input v-model="dataForm.descript" placeholder="介绍"></el-input>
            </el-form-item>
            <el-form-item label="显示状态" prop="showStatus">
                <el-switch
                    v-model="dataForm.showStatus"
                    active-text="显示"
                    inactive-text="不显示"
                    :active-value="1"
                    :inactive-value="0">
                </el-switch>
            </el-form-item>
            <el-form-item label="检索首字母" prop="firstLetter">
                <el-input v-model="dataForm.firstLetter" placeholder="检索首字母"></el-input>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
                <el-input v-model.number="dataForm.sort" placeholder="排序"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
    </el-dialog>
</template>

<script>
import {mapActions} from 'vuex'
import { v4 as uuid } from 'uuid';

export default {
    data () {
        return {
            visible: false,
            dataForm: {
                brandId: 0,
                name: '',
                logo: '',
                descript: '',
                showStatus: '',
                firstLetter: '',
                sort: 0
            },
            dataRule: {
                name: [
                    {required: true, message: '品牌名不能为空', trigger: 'blur'}
                ],
                logo: [
                    {required: true, message: '品牌logo地址不能为空', trigger: 'blur'}
                ],
                showStatus: [
                    {required: true, message: '显示状态不能为空', trigger: 'blur'}
                ],
                firstLetter: [
                    {validator: (rule, value, callback) => {
                        if (/^[A-Za-z]$/.test(value)) {
                            callback();
                        } else {
                            callback(new Error("首字母必须单个英文字母"));
                        }
                    }, trigger: 'blur'}
                ],
                sort: [
                    {validator: (rule, value, callback) => {
                        if (/^\d+$/.test(value)) {
                            callback();
                        } else {
                            callback(new Error("排序必须为正整数"));
                        }
                    }, trigger: 'blur'}
                ]
            },
            signature: {
                policy: "",
                signature: "",
                key: "",
                ossaccessKeyId: "",
                dir: "",
                host: "",
                file: undefined
            }
        }
    },
    methods: {
        ...mapActions("brand", ["getSignature"]),
        init (id) {
            this.dataForm.brandId = id || 0
            this.visible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
                if (this.dataForm.brandId) {
                    this.$http({
                        url: this.$http.adornUrl(`/product/brand/info/${this.dataForm.brandId}`),
                        method: 'get',
                        params: this.$http.adornParams()
                    }).then(({data}) => {
                        if (data && data.code === 0) {
                            this.dataForm.name = data.brand.name
                            this.dataForm.logo = data.brand.logo
                            this.dataForm.descript = data.brand.descript
                            this.dataForm.showStatus = data.brand.showStatus
                            this.dataForm.firstLetter = data.brand.firstLetter
                            this.dataForm.sort = data.brand.sort
                        }
                    })
                }
            })
        },
        // 表单提交
        dataFormSubmit () {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    this.$http({
                        url: this.$http.adornUrl(`/product/brand/${!this.dataForm.brandId ? 'save' : 'update'}`),
                        method: 'post',
                        data: this.$http.adornData({
                            'brandId': this.dataForm.brandId || undefined,
                            'name': this.dataForm.name,
                            'logo': this.dataForm.logo,
                            'descript': this.dataForm.descript,
                            'showStatus': this.dataForm.showStatus,
                            'firstLetter': this.dataForm.firstLetter,
                            'sort': this.dataForm.sort
                        })
                    }).then(({data}) => {
                        if (data && data.code === 0) {
                            this.$message({
                                message: '操作成功',
                                type: 'success',
                                duration: 1500,
                                onClose: () => {
                                    this.visible = false
                                    this.$emit('refreshDataList')
                                }
                            })
                        } else {
                            this.$message.error(data.msg)
                        }
                    })
                }
            })
        },
        async beforeAvatarUpload (file) {
            const isJPG = file.type === 'image/jpeg';
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                this.$message.error('上传图片只能是 JPG 格式!');
            }
            if (!isLt2M) {
                this.$message.error('上传图片大小不能超过 2MB!');
            }
            if (isJPG && isLt2M) {
                await this.getSignature().then(res => {
                    let sign = this.$store.state.brand.signature
                    this.signature = {
                        policy: sign.policy,
                        signature: sign.signature,
                        key: sign.dir + uuid() + "_${filename}",
                        ossaccessKeyId: sign.accessId,
                        dir: sign.dir,
                        host: sign.host
                    }
                });
            }
        },
        handleAvatarSuccess(res, file) {
            this.dataForm.logo = this.signature.host + '/' + this.signature.key.replace("${filename}",file.name);
        }
    }
}
</script>
<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
