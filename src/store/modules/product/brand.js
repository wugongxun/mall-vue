import http from '../../../utils/httpRequest'

const actions = {
    async getSignature ({commit}) {
        let {data} = await http({
            url: http.adornUrl("/other/oss/getSignature"),
            method: "get"
        });
        if (data.code == 0) {
            commit("GETSIGNATURE", data.data);
        } else {
            return Promise.reject(new Error(data.msg));
        }
    }
};
const mutations = {
    GETSIGNATURE(state, signature) {
        state.signature = signature;
    }
};
const state = {
    signature: {}
};

export default {
    namespaced: true,
    actions, mutations, state
}
