import http from '../../../utils/httpRequest'

const actions = {
    async getCategory({commit}) {
        let {data} = await http({
            url: http.adornUrl("/product/category/list/tree"),
            method: "get"
        });
        if (data.code == 0) {
            return data.data;
        } else {
            return Promise.reject(new Error(data.msg));
        }
    },
    async delCategoryByIds({commit}, catIds) {
        let {data} = await http({
            url: http.adornUrl("/product/category/delete"),
            method: "post",
            data: http.adornData(catIds, false)
        });
        if (data.code != 0) {
            return Promise.reject(new Error(data.msg));
        }
    },
    async toAddCategory({commit}, category) {
        let {data} = await http({
            url: http.adornUrl("/product/category/save"),
            method: "post",
            data: http.adornData(category, false)
        });
        if (data.code != 0) {
            return Promise.reject(new Error(data.msg));
        }
    },
    async toUpdateCategory({commit}, category) {
        let {data} = await http({
            url: http.adornUrl("/product/category/update"),
            method: "post",
            data: http.adornData(category, false)
        });
        if (data.code != 0) {
            return Promise.reject(new Error(data.msg));
        }
    },
    async updateBatchById({commit}, categories) {
        let {data} = await http({
            url: http.adornUrl("/product/category/updateBatchById"),
            method: "post",
            data: http.adornData(categories, false)
        });
        if (data.code != 0) {
            return Promise.reject(new Error(data.msg));
        }
    },
    async deleteBatchById({commit}, ids) {
        let {data} = await http({
            url: http.adornUrl("/product/category/delete"),
            method: "post",
            data: http.adornData(ids, false)
        });
        if (data.code != 0) {
            return Promise.reject(new Error(data.msg));
        }
    }
}

const mutations = {

}

const state = {

}

export default {
    namespaced: true,
    actions, mutations, state
}
