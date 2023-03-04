import http from '../../../utils/httpRequest'

const actions = {
    async getCategory({commit}) {
        let res = await http({
            url: http.adornUrl("/product/category/list/tree"),
            method: "get"
        });
        console.log(res)
        if (res.code == 0) {
            console.log(res.data)
            // commit("GETCATEGORY", res.data);
        }
    }
}

const mutations = {
    GETCATEGORY(state, category) {
        state.category = category;
    }
}

const state = {
    category: []
}

export default {
    namespaced: true,
    actions, mutations, state
}
