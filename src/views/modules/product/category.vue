<template>
    <div>
        <el-switch
            v-model="enableDrag"
            active-text="开启拖拽"
            inactive-text="关闭拖拽">
        </el-switch>

        <el-button type="primary" :disabled="!enableDrag" @click="saveChange">保存</el-button>
        <el-button type="danger" @click="batchDelete" style="float: right">批量删除</el-button>

        <el-tree :data="categories"
                 :draggable="enableDrag"
                 show-checkbox
                 :props="defaultProps"
                 :expand-on-click-node="false"
                 node-key="catId"
                 :default-expanded-keys="expandedKeys"
                 :allow-drop="allowDrop"
                 @node-drop="handleDrop"
                 ref="tree">
            <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
                <span>
                    <el-button
                        v-if="node.level < 3"
                        type="text"
                        size="mini"
                        @click="append(data)">
                    添加
                    </el-button>
                    <el-button
                        v-if="!data.children || data.children.length == 0"
                        type="text"
                        size="mini"
                        @click="remove(node, data)">
                    删除
                    </el-button>
                    <el-button
                        type="text"
                        size="mini"
                        @click="edit(data)">
                    修改
                    </el-button>
                </span>
            </span>
        </el-tree>

        <el-dialog title="添加分类" :visible.sync="dialogVisible" center width="30%" @close="resetForm">
            <el-form :model="category">
                <el-form-item label="分类名称" label-width="80px">
                    <el-input v-model="category.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="计量单位" label-width="80px">
                    <el-input v-model="category.productUnit" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addOrUpdateCategory">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {mapActions} from 'vuex'

export default {
    name: 'Category',
    data () {
        return {
            categories: [],
            expandedKeys: [],
            dialogVisible: false,
            updateNodes: [],
            enableDrag: false,
            category: {
                catId: "",
                name: "",
                parentCid: "",
                productUnit: "",
                catLevel: 0,
                sort: 0,
                showStatus: 1
            },
            defaultProps: {
                children: 'children',
                label: 'name'
            }
        }
    },
    methods: {
        ...mapActions('category', ['getCategory', 'delCategoryByIds', 'toAddCategory', 'toUpdateCategory', 'updateBatchById', 'deleteBatchById']),
        async getData () {
            this.categories = await this.getCategory();
        },
        append (data) {
            this.dialogVisible = true;
            this.category.parentCid = data.catId;
            this.expandedKeys = [data.catId];
            this.category.catLevel = data.catLevel + 1;
        },
        remove (node, data) {
            this.$confirm(`确认删除${data.name}?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.delCategoryByIds([data.catId]).then(res => {
                    this.$message.success('删除成功!')
                    this.expandedKeys = [data.parentCid]
                    this.getData();
                }).catch(error => {
                    this.$message.error(error)
                })
            }).catch(() => {

            })
        },
        addOrUpdateCategory() {
            if (this.category.catId) {
                this.toUpdateCategory(this.category).then(res => {
                    this.$message.success("修改成功!");
                    this.getData();
                    this.dialogVisible = false;
                }).catch(error => {
                    this.$message.error(error.msg);
                });
            } else {
                this.toAddCategory(this.category).then(res => {
                    this.$message.success("添加成功!");
                    this.getData();
                    this.dialogVisible = false;
                }).catch(error => {
                    this.$message.error(error.msg);
                });
            }
        },
        resetForm() {
            this.$data.category = this.$options.data().category;
        },
        edit(data) {
            Object.assign(this.category, data);
            this.expandedKeys = [data.catId];
            this.dialogVisible = true;
        },
        allowDrop(draggingNode, dropNode, type) {
            let level = this.countLevel(draggingNode);
            if (type === 'inner') {
                return level + dropNode.level < 4;
            } else {
                return level + dropNode.parent.level < 4;
            }
        },
        //统计节点的层数
        countLevel(draggingNode) {
            let level = 0;
            if (draggingNode.childNodes.length) {
                draggingNode.childNodes.forEach(item => {
                    level = Math.max(level, this.countLevel(item));
                });
            }
            return level + 1;
        },
        handleDrop(draggingNode, dropNode, dropType, ev) {
            let parentCid, siblings;
            //根据dropType计算修改后的父id和兄弟节点集合
            if (dropType === "inner") {
                parentCid = dropNode.data.catId;
                siblings = dropNode.childNodes;
            } else {
                parentCid = dropNode.parent.data.catId || 0;
                siblings = dropNode.parent.childNodes;
            }
            //如果拖动后的level改变了，同时需要改变子节点的level
            let level;
            if (dropType === "inner" && draggingNode.level != dropNode.level + 1) {
                level = dropNode.level + 1;
            } else if ((dropType === "before" || dropType === "after") && draggingNode.level != dropNode.level) {
                level = dropNode.level;
            }
            if (level) {
                draggingNode.childNodes.forEach(item => {
                    this.updateNodes.push({
                        catId: item.data.catId,
                        catLevel: level + 1
                    });
                });
            }
            //对所有的兄弟节点进行排序
            siblings.forEach((item, index) => {
                if (item.data.catId == draggingNode.data.catId) {
                    let node = {
                        catId: item.data.catId,
                        parentCid,
                        sort: index
                    };
                    //改变本身的catLevel
                    if (level) {
                        node.catLevel = level;
                    }
                    this.updateNodes.push(node);
                } else {
                    this.updateNodes.push({
                        catId: item.data.catId,
                        sort: index
                    });
                }
            });
        },
        saveChange() {
            this.updateBatchById(this.updateNodes).then(res => {
                this.$message.success("修改成功");
                this.getData();
            }).catch(error => {
                this.$message.error(error.msg);
            });
            this.updateNodes = [];
        },
        batchDelete() {
            this.$confirm(`确认删除?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let ids = [];
                this.$refs.tree.getCheckedNodes().forEach(item => {
                    ids.push(item.catId);
                });
                this.deleteBatchById(ids).then(res => {
                    this.$message.success("删除成功!");
                    this.expandedKeys = this.$refs.tree.getHalfCheckedNodes().map(item => item.catId);
                    this.getData();
                }).catch(error => {
                    this.$message.error(error.msg);
                });
            }).catch(() => {});
        }
    },
    mounted () {
        this.getData();
    }
}
</script>

<style scoped>
.el-tree {
    margin-top: 20px;
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>
